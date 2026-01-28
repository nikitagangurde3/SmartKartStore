// cleanup.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Cleaning up project...');

// Kill any running processes on port 30001
try {
    execSync('netstat -ano | findstr :30001', { stdio: 'inherit' });
    console.log('⚠️  Port 30001 is in use');

    // For Windows - find and kill process
    execSync('FOR /F "tokens=5" %a in (\'netstat -ano ^| findstr :30001\') do taskkill /F /PID %a', { shell: true });
    console.log('✅ Killed processes on port 30001');
} catch (error) {
    console.log('✅ Port 30001 is free');
}

// Delete Vite cache
const viteCache = path.join(__dirname, 'node_modules', '.vite');
if (fs.existsSync(viteCache)) {
    console.log('🗑️  Deleting Vite cache...');
    fs.rmSync(viteCache, { recursive: true, force: true });
    console.log('✅ Vite cache deleted');
}

// Delete dist folder
const distFolder = path.join(__dirname, 'dist');
if (fs.existsSync(distFolder)) {
    console.log('🗑️  Deleting dist folder...');
    fs.rmSync(distFolder, { recursive: true, force: true });
    console.log('✅ Dist folder deleted');
}

console.log('✨ Cleanup complete!');
console.log('Run: npm run dev');