const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const os = require('os-utils');

/**
 * Start monitoring HLS folders for new .ts segments.
 * @param {string} rootDirectory - The root HLS directory.
 * @param {number} segmentDurationSeconds - Expected duration per segment (e.g., 8 seconds).
 */
function startMonitoring(rootDirectory, segmentDurationSeconds = 8)
{
  console.log('\n\n\nStarting monitoring of:', rootDirectory);

  // Verify that the root directory exists
  if (!fs.existsSync(rootDirectory)) {
    console.error(`Root directory does not exist: ${rootDirectory}`);
    return;
  }

  // Gather all subdirectories in the root directory
  const foldersToMonitor = fs.readdirSync(rootDirectory)
    .map((name) => path.join(rootDirectory, name))
    .filter((source) => fs.lstatSync(source).isDirectory());

  if (foldersToMonitor.length === 0) {
    console.error(`No subdirectories found in root directory: ${rootDirectory}`);
    return;
  }
  else
  {
    console.log('Monitoring the following folders:');
    foldersToMonitor.forEach((folder) => {
      console.log(folder);
    });
    
  }

  // Data structure to store segment times for each folder
  // Example: fileTimestamps[folder] = [timestamp1, timestamp2, ...]
  const fileTimestamps = {};

  // Initialize the data structure
  foldersToMonitor.forEach((folder) => {
    fileTimestamps[folder] = [];
  });

  // Helper to parse filenames in YYYYmmddHHMMSS format -> timestamp in ms
  function parseFilenameToMs(filePath) {
    try {
      const baseName = path.basename(filePath, '.ts'); // e.g. "20250118103045"
      // The substring indexes below assume strictly "YYYYmmddHHMMSS" (14 digits).
      if (baseName.length < 14) {
        throw new Error(`Filename does not have 14 digits: ${baseName}`);
      }

      const year = parseInt(baseName.slice(0, 4), 10);
      const month = parseInt(baseName.slice(4, 6), 10) - 1; // zero-based for JS Date
      const day = parseInt(baseName.slice(6, 8), 10);
      const hour = parseInt(baseName.slice(8, 10), 10);
      const minute = parseInt(baseName.slice(10, 12), 10);
      const second = parseInt(baseName.slice(12, 14), 10);

      const parsedDate = new Date(year, month, day, hour, minute, second);

      // Return milliseconds since epoch
      return parsedDate.getTime();
    } catch (err) {
      console.error(`Error parsing segment filename: ${filePath}`, err.message);
      return null; // Could not parse
    }
  }

  // If for some reason the filename doesn't have a timestamp,
  // you can also fall back to using fs.stat's mtime or ctime:
  function getStatTimestampMs(filePath) {
    try {
      const stats = fs.statSync(filePath);
      // Use creation time or modification time as needed:
      return stats.birthtimeMs || stats.mtimeMs;
    } catch (err) {
      console.error(`Error reading file stats: ${filePath}`, err.message);
      return null;
    }
  }

  // Monitor each folder
  foldersToMonitor.forEach((folder) => {
    const watcher = chokidar.watch(path.join(folder, '*.ts'), {
      persistent: true,
      ignoreInitial: false,
    });

    watcher.on('add', (filePath) => {
      // Approach A: Parse from filename
      let timestampMs = parseFilenameToMs(filePath);

      // Approach B (fallback): Use fs.stat if parsing fails
      if (!timestampMs) {
        timestampMs = getStatTimestampMs(filePath);
        if (!timestampMs) {
          console.warn(`Cannot determine a timestamp for: ${filePath}`);
          return; // Skip if we can't get any time
        }
      }

      // Store the timestamp
      fileTimestamps[folder].push(timestampMs);

      // Limit the array size to avoid memory bloat
      if (fileTimestamps[folder].length > 100) {
        fileTimestamps[folder].shift();
      }

      // If at least two timestamps, calculate differences
      const timestamps = fileTimestamps[folder];
      if (timestamps.length > 1) {
        const lastTime = timestamps[timestamps.length - 1];
        const prevTime = timestamps[timestamps.length - 2];
        const diffMs = lastTime - prevTime;
        const diffSeconds = diffMs / 1000;

        // Warn if the difference is bigger than segmentDurationSeconds
        if (diffSeconds > segmentDurationSeconds) {
          console.warn(
            `WARNING: Folder "${folder}" took ${diffSeconds.toFixed(2)}s for a new segment, ` +
            `which is longer than the expected ${segmentDurationSeconds}s!`
          );
        } else {
          console.log(
            `Folder "${folder}": New segment after ${diffSeconds.toFixed(2)}s (OK).`
          );
        }

        // Optionally compute an average
        const timeDifferences = [];
        for (let i = 1; i < timestamps.length; i++) {
          timeDifferences.push(timestamps[i] - timestamps[i - 1]);
        }
        const sum = timeDifferences.reduce((a, b) => a + b, 0);
        const averageTime = sum / timeDifferences.length;

        // Also log CPU usage for context
        os.cpuUsage(function (cpuUsedPercent) {
          console.log(
            `\nFolder: "${folder}"\n` +
            `   Average time: ${(averageTime / 1000).toFixed(2)} seconds\n` +
            `   CPU Usage: ${(cpuUsedPercent * 100).toFixed(2)}%\n` +
            `---------------------------------------------\n`
          );
        });
      }
    });

    watcher.on('error', (error) => {
      console.error(`Watcher error in folder ${folder}: ${error}`);
    });
  });

  // Optional: Periodically log CPU/Memory usage globally
  setInterval(() => {
    os.cpuUsage((cpuPercent) => {
      console.log(
        `Global CPU Usage: ${(cpuPercent * 100).toFixed(2)}%\n` +
        `Free Memory: ${(os.freememPercentage() * 100).toFixed(2)}%\n` +
        '---------------------------'
      );
    });
  }, 5000);
}

module.exports = { startMonitoring };