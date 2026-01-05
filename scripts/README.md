# Audio Processing Tools

This folder contains scripts to process beat audio files.

## Setup (One Time)

1. **Install FFmpeg:**
   - Download from: https://www.gyan.dev/ffmpeg/builds/
   - Get "ffmpeg-release-essentials.zip"
   - Extract and add `bin` folder to your system PATH
   - Or use: `winget install ffmpeg`

2. **Install dependencies:**
   ```bash
   cd scripts
   npm install
   ```

## Usage

### Process a single WAV file:
```bash
node process-beat.js "path/to/your-beat.wav"
```

This will create:
- `your-beat_tagged.mp3` - MP3 with your voice tag every 30 seconds (for streaming)
- The original WAV stays untouched (for paid downloads)

### Process all WAV files in a folder:
```bash
node process-all.js "path/to/folder"
```

## Output
- Tagged MP3 files will be created in the same folder as the original WAV
- Upload the MP3 as "Audio (streaming)" and WAV as "WAV File" in admin panel
