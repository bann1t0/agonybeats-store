/**
 * AgonyBeats - Batch Audio Processor
 * 
 * Processes all WAV files in a folder
 * 
 * Usage: node process-all.js "path/to/folder"
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get folder from command line
const inputFolder = process.argv[2];

if (!inputFolder) {
    console.log('❌ Usage: node process-all.js "path/to/folder"');
    process.exit(1);
}

// Verify folder exists
if (!fs.existsSync(inputFolder)) {
    console.log(`❌ Folder not found: ${inputFolder}`);
    process.exit(1);
}

// Find all WAV files
const files = fs.readdirSync(inputFolder)
    .filter(file => file.toLowerCase().endsWith('.wav'))
    .filter(file => !file.includes('_tagged')); // Skip already processed

if (files.length === 0) {
    console.log('❌ No WAV files found in folder');
    process.exit(1);
}

console.log('🎵 AgonyBeats Batch Processor');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📂 Folder: ${inputFolder}`);
console.log(`📄 Files found: ${files.length}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Process each file
async function processAll() {
    let processed = 0;
    let errors = 0;

    for (const file of files) {
        const filePath = path.join(inputFolder, file);
        console.log(`\n[${processed + 1}/${files.length}] Processing: ${file}`);

        try {
            // Run the single file processor
            execSync(`node "${path.join(__dirname, 'process-beat.js')}" "${filePath}"`, {
                stdio: 'inherit'
            });
            processed++;
        } catch (error) {
            console.log(`❌ Error processing ${file}`);
            errors++;
        }
    }

    console.log('\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:');
    console.log(`   ✅ Processed: ${processed}`);
    if (errors > 0) {
        console.log(`   ❌ Errors: ${errors}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

processAll();
