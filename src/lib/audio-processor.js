/**
 * Client-side audio processor for WAV to MP3 conversion with voice tag
 * Uses Web Audio API and lamejs for browser-based processing
 */

import lamejs from 'lamejs';

// Tag file URL (relative to public folder)
const TAG_URL = '/tag/tag agony new.wav';
const TAG_INTERVAL_SECONDS = 30;
const OUTPUT_BITRATE = 192;

/**
 * Load an audio file and decode it to AudioBuffer
 */
async function loadAudioBuffer(file) {
    const arrayBuffer = await file.arrayBuffer();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    return await audioContext.decodeAudioData(arrayBuffer);
}

/**
 * Load the tag audio from the server
 */
async function loadTagBuffer() {
    const response = await fetch(TAG_URL);
    if (!response.ok) {
        throw new Error('Failed to load voice tag file');
    }
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    return await audioContext.decodeAudioData(arrayBuffer);
}

/**
 * Mix tag into the main audio at specified intervals
 */
function mixTagIntoAudio(mainBuffer, tagBuffer, intervalSeconds = 30, tagVolume = 0.7) {
    const sampleRate = mainBuffer.sampleRate;
    const duration = mainBuffer.duration;
    const numChannels = mainBuffer.numberOfChannels;

    // Create output buffer
    const length = mainBuffer.length;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const outputBuffer = audioContext.createBuffer(numChannels, length, sampleRate);

    // Copy main audio to output
    for (let channel = 0; channel < numChannels; channel++) {
        const outputData = outputBuffer.getChannelData(channel);
        const mainData = mainBuffer.getChannelData(channel);
        outputData.set(mainData);
    }

    // Calculate tag insertion points
    const tagLength = tagBuffer.length;
    const tagSampleRate = tagBuffer.sampleRate;

    // Resample tag if needed (if sample rates don't match)
    let tagData = [];
    for (let ch = 0; ch < Math.min(numChannels, tagBuffer.numberOfChannels); ch++) {
        if (tagSampleRate === sampleRate) {
            tagData[ch] = tagBuffer.getChannelData(ch);
        } else {
            // Simple resampling
            const ratio = tagSampleRate / sampleRate;
            const newLength = Math.floor(tagBuffer.length / ratio);
            tagData[ch] = new Float32Array(newLength);
            const sourceData = tagBuffer.getChannelData(ch);
            for (let i = 0; i < newLength; i++) {
                const sourceIndex = Math.floor(i * ratio);
                tagData[ch][i] = sourceData[sourceIndex] || 0;
            }
        }
    }

    const resampledTagLength = tagData[0].length;

    // Insert tag at each interval
    const numTags = Math.floor(duration / intervalSeconds);

    for (let i = 0; i < Math.max(1, numTags); i++) {
        const insertSample = Math.floor(i * intervalSeconds * sampleRate);

        for (let channel = 0; channel < numChannels; channel++) {
            const outputData = outputBuffer.getChannelData(channel);
            const tagChannelData = tagData[Math.min(channel, tagData.length - 1)];

            for (let j = 0; j < resampledTagLength && insertSample + j < length; j++) {
                // Mix tag with existing audio (overlay)
                outputData[insertSample + j] += tagChannelData[j] * tagVolume;

                // Clamp to prevent clipping
                if (outputData[insertSample + j] > 1) outputData[insertSample + j] = 1;
                if (outputData[insertSample + j] < -1) outputData[insertSample + j] = -1;
            }
        }
    }

    return outputBuffer;
}

/**
 * Encode AudioBuffer to MP3 using lamejs
 */
function encodeToMp3(audioBuffer, bitrate = 192) {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const samples = audioBuffer.length;

    // Get channel data
    const leftChannel = audioBuffer.getChannelData(0);
    const rightChannel = numChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel;

    // Convert Float32 to Int16
    const leftInt16 = new Int16Array(samples);
    const rightInt16 = new Int16Array(samples);

    for (let i = 0; i < samples; i++) {
        leftInt16[i] = Math.max(-32768, Math.min(32767, Math.floor(leftChannel[i] * 32767)));
        rightInt16[i] = Math.max(-32768, Math.min(32767, Math.floor(rightChannel[i] * 32767)));
    }

    // Create MP3 encoder
    const mp3encoder = new lamejs.Mp3Encoder(numChannels > 1 ? 2 : 1, sampleRate, bitrate);

    const mp3Data = [];
    const sampleBlockSize = 1152; // MP3 frame size

    for (let i = 0; i < samples; i += sampleBlockSize) {
        const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
        const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);

        let mp3buf;
        if (numChannels > 1) {
            mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
        } else {
            mp3buf = mp3encoder.encodeBuffer(leftChunk);
        }

        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }

    // Flush remaining data
    const mp3end = mp3encoder.flush();
    if (mp3end.length > 0) {
        mp3Data.push(mp3end);
    }

    // Combine all chunks
    const totalLength = mp3Data.reduce((acc, buf) => acc + buf.length, 0);
    const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });

    return mp3Blob;
}

/**
 * Process a WAV file: convert to MP3 and add voice tag
 * @param {File} wavFile - The WAV file to process
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<{streamingMp3: Blob, taggedMp3: Blob}>}
 */
export async function processWavFile(wavFile, onProgress = () => { }) {
    try {
        onProgress(5);

        // Load the main audio
        const mainBuffer = await loadAudioBuffer(wavFile);
        onProgress(20);

        // Create untagged streaming MP3
        onProgress(30);
        const streamingMp3 = encodeToMp3(mainBuffer, OUTPUT_BITRATE);
        onProgress(50);

        // Load tag and mix
        let taggedMp3;
        try {
            const tagBuffer = await loadTagBuffer();
            onProgress(60);

            const mixedBuffer = mixTagIntoAudio(mainBuffer, tagBuffer, TAG_INTERVAL_SECONDS);
            onProgress(80);

            taggedMp3 = encodeToMp3(mixedBuffer, OUTPUT_BITRATE);
        } catch (tagError) {
            console.warn('Could not load tag, creating untagged version:', tagError);
            taggedMp3 = streamingMp3;
        }

        onProgress(100);

        return {
            streamingMp3,
            taggedMp3
        };
    } catch (error) {
        console.error('Audio processing error:', error);
        throw error;
    }
}

/**
 * Convert Blob to File object
 */
export function blobToFile(blob, filename) {
    return new File([blob], filename, { type: blob.type });
}
