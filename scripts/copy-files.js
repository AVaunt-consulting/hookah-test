// Cross-platform file copy script for Netlify deployment
import fs from 'fs';
import path from 'path';

const SOURCE_DIR = './static';
const TARGET_DIR = './.netlify/functions-internal';
const REDIRECTS_FILE = './_redirects';

// Create target directory if it doesn't exist
if (!fs.existsSync(TARGET_DIR)) {
  console.log(`Creating directory: ${TARGET_DIR}`);
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Create a visible indicator that the build is using our files
fs.writeFileSync(path.join(TARGET_DIR, 'build-info.txt'), `Build created at: ${new Date().toISOString()}\nIncludes custom redirects and static files`);

// Copy _redirects file
console.log(`Copying ${REDIRECTS_FILE} to ${TARGET_DIR}`);
fs.copyFileSync(REDIRECTS_FILE, path.join(TARGET_DIR, '_redirects'));

// Recursive function to copy directory contents
function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      // Create directory if it doesn't exist
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyDir(srcPath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${srcPath} to ${destPath}`);
    }
  }
}

// Copy static directory contents
console.log(`Copying contents from ${SOURCE_DIR} to ${TARGET_DIR}`);
copyDir(SOURCE_DIR, TARGET_DIR);

console.log('All files copied successfully!');

// Verify the redirects file exists in the target directory
if (fs.existsSync(path.join(TARGET_DIR, '_redirects'))) {
  console.log('Verified _redirects file is in the build directory');
} else {
  console.error('ERROR: _redirects file is missing from the build directory!');
  process.exit(1);
} 