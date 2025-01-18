const readline = require('readline');
const chokidar = require('chokidar');
const path = require('path');

// Path to ignore (e.g., ignore the "node_modules" folder or any specific path)
const ignorePath = 'path/to/ignore';

// Instantiate the watcher
const watcher = chokidar.watch('/Users/riccardofrezza/Desktop/video_temp/champagne', {
  ignored: filePath => {
    const normalizedPath = path.normalize(filePath);

    // Ignore dot files
    const isDotFile = normalizedPath.split(path.sep).some(segment => segment.startsWith('.'));
    
    // Ignore .tmp files
    const isTempFile = normalizedPath.endsWith('.tmp');
    
    // Ignore specific path
    const isIgnoredPath = normalizedPath.endsWith(path.resolve('/Users/riccardofrezza/Desktop/video_temp/champagne/karlmarx'));

    // Combine all ignore conditions
    return isDotFile || isTempFile || isIgnoredPath;
  },
  persistent: true,
  usePolling: false,
});

// Define event handlers
watcher
  .on('add', filePath => console.log(`File added: ${filePath}`))
  .on('change', filePath => console.log(`File changed: ${filePath}`))
  .on('unlink', filePath => console.log(`File removed: ${filePath}`))
  .on('error', error => console.error(`Watcher error: ${error}`));

watcher.on('ready', () => console.log('Watcher is ready!'));

// Setup input listener for manual exit
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('Press Ctrl+C to exit, or type "exit" and press Enter.');

// Listen for input to exit
rl.on('line', input => {
  if (input.trim().toLowerCase() === 'exit') {
    console.log('Exiting...');
    watcher.close().then(() => {
      console.log('Watcher closed.');
      rl.close(); // Close the readline interface
      process.exit(0); // Exit the process
    });
  }
});

// Handle Ctrl+C to exit gracefully
process.on('SIGINT', () => {
  console.log('\nCaught interrupt signal. Exiting...');
  watcher.close().then(() => {
    console.log('Watcher closed.');
    rl.close();
    process.exit(0);
  });
});