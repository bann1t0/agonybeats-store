// debug-r2-env.js
// Check if R2 environment variables are loaded correctly

console.log('🔍 Checking R2 Environment Variables...\n');

const requiredVars = {
    'R2_ACCOUNT_ID': process.env.R2_ACCOUNT_ID,
    'R2_ACCESS_KEY_ID': process.env.R2_ACCESS_KEY_ID,
    'R2_SECRET_ACCESS_KEY': process.env.R2_SECRET_ACCESS_KEY,
    'R2_BUCKET_NAME': process.env.R2_BUCKET_NAME,
    'R2_ENDPOINT': process.env.R2_ENDPOINT,
    'R2_PUBLIC_URL': process.env.R2_PUBLIC_URL,
};

let allPresent = true;

for (const [key, value] of Object.entries(requiredVars)) {
    if (value) {
        // Mask sensitive values
        let displayValue = value;
        if (key.includes('SECRET') || key.includes('KEY_ID')) {
            displayValue = value.substring(0, 8) + '...' + value.substring(value.length - 8);
        }
        console.log(`✅ ${key}: ${displayValue}`);
    } else {
        console.log(`❌ ${key}: NOT SET`);
        allPresent = false;
    }
}

console.log('\n---');

if (allPresent) {
    console.log('✅ All R2 environment variables are present!\n');

    // Show Access Key ID clearly for verification
    console.log('⚠️  IMPORTANT: Verify Access Key ID:');
    console.log(`   ${process.env.R2_ACCESS_KEY_ID}`);
    console.log('   Check for typos: letter O vs number 0, letter I vs number 1\n');
} else {
    console.log('❌ Some R2 environment variables are missing!\n');
    console.log('Please check your .env file and ensure all R2_ variables are set.\n');
    process.exit(1);
}
