/**
 * AgonyBeats - Beat Audio Processor
 * 
 * Converts WAV to MP3 and adds voice tag every 30 seconds
 * 
 * Usage: node process-beat.js "path/to/beat.wav"
 */

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Configuration
const TAG_INTERVAL_SECONDS = 30; // Add tag every 30 seconds
const TAG_FILE = path.join(__dirname, '..', 'public', 'tag', 'tag agony new.wav');
const OUTPUT_BITRATE = '192k';
const TAG_VOLUME = 0.7; // Tag volume (0.0 - 1.0)

// Get input file from command line
const inputFile = process.argv[2];

if (!inputFile) {
    console.log('❌ Usage: node process-beat.js "path/to/beat.wav"');
    process.exit(1);
}

// Verify input file exists
if (!fs.existsSync(inputFile)) {
    console.log(`❌ File not found: ${inputFile}`);
    process.exit(1);
}

// Verify tag file exists
if (!fs.existsSync(TAG_FILE)) {
    console.log(`❌ Tag file not found: ${TAG_FILE}`);
    console.log('Please place your tag file at: public/tag/tag agony new.wav');
    process.exit(1);
}

// Generate output filename
const inputDir = path.dirname(inputFile);
const inputName = path.basename(inputFile, path.extname(inputFile));
const outputFile = path.join(inputDir, `${inputName}_tagged.mp3`);

console.log('🎵 AgonyBeats Audio Processor');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📂 Input:  ${inputFile}`);
console.log(`🏷️  Tag:    ${TAG_FILE}`);
console.log(`📁 Output: ${outputFile}`);
console.log(`⏱️  Tag interval: Every ${TAG_INTERVAL_SECONDS} seconds`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// First, get the duration of the input file
function getDuration(file) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(file, (err, metadata) => {
            if (err) reject(err);
            else resolve(metadata.format.duration);
        });
    });
}

// Get tag duration
function getTagDuration() {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(TAG_FILE, (err, metadata) => {
            if (err) reject(err);
            else resolve(metadata.format.duration);
        });
    });
}

async function processAudio() {
    try {
        console.log('⏳ Analyzing audio...');

        const duration = await getDuration(inputFile);
        const tagDuration = await getTagDuration();

        console.log(`   Beat duration: ${Math.round(duration)} seconds`);
        console.log(`   Tag duration: ${Math.round(tagDuration * 10) / 10} seconds`);

        // Calculate how many tags we need
        const numTags = Math.floor(duration / TAG_INTERVAL_SECONDS);
        console.log(`   Tags to insert: ${numTags}`);

        if (numTags === 0) {
            console.log('⚠️  Beat is shorter than 30 seconds, adding one tag at the start...');
        }

        // Build the complex filter for mixing tags
        // We'll create a filter that overlays the tag at each interval
        let filterComplex = '';
        let inputs = '[0:a]'; // Main audio

        // Generate tag overlay points
        const tagPoints = [];
        for (let i = 0; i < Math.max(1, numTags); i++) {
            const startTime = i * TAG_INTERVAL_SECONDS;
            tagPoints.push(startTime);
        }

        // Build filter: delay each tag to its position and mix
        // Format: [1:a]adelay=30000|30000,volume=0.7[tag1];[1:a]adelay=60000|60000,volume=0.7[tag2];...
        const tagFilters = tagPoints.map((time, index) => {
            const delayMs = time * 1000;
            return `[1:a]adelay=${delayMs}|${delayMs},volume=${TAG_VOLUME}[tag${index}]`;
        });

        // Mix all together
        const tagLabels = tagPoints.map((_, index) => `[tag${index}]`).join('');
        const mixInputs = `[0:a]${tagLabels}`;
        const numInputs = tagPoints.length + 1;

        filterComplex = tagFilters.join(';') + `;${mixInputs}amix=inputs=${numInputs}:duration=first:dropout_transition=0[out]`;

        console.log('⏳ Processing audio (this may take a moment)...');

        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(inputFile)
                .input(TAG_FILE)
                .complexFilter(filterComplex, 'out')
                .audioBitrate(OUTPUT_BITRATE)
                .audioCodec('libmp3lame')
                .on('progress', (progress) => {
                    if (progress.percent) {
                        process.stdout.write(`\r   Progress: ${Math.round(progress.percent)}%   `);
                    }
                })
                .on('end', () => {
                    console.log('\n');
                    resolve();
                })
                .on('error', (err) => {
                    reject(err);
                })
                .save(outputFile);
        });

        // Get output file size
        const stats = fs.statSync(outputFile);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log('✅ Processing complete!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📁 Output file: ${outputFile}`);
        console.log(`📊 File size: ${fileSizeMB} MB`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('📋 Next steps:');
        console.log('   1. Upload the _tagged.mp3 as "Audio (streaming)" in admin panel');
        console.log('   2. Upload the original .wav as "WAV File" for purchases');

    } catch (error) {
        console.error('❌ Error processing audio:', error.message);

        if (error.message.includes('ffmpeg')) {
            console.log('');
            console.log('💡 FFmpeg not found! Please install it:');
            console.log('   Option 1: winget install ffmpeg');
            console.log('   Option 2: Download from https://www.gyan.dev/ffmpeg/builds/');
        }

        process.exit(1);
    }
}

processAudio();
