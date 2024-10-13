const chokidar = require('chokidar');
const path = require('path');
const os = require('os-utils');
const fs = require('fs');

/**
 * Function to start monitoring HLS folders
 * @param {string} rootDirectory - The root HLS directory
 */
function startMonitoring(rootDirectory) {
    // Verify that the root directory exists
    if (!fs.existsSync(rootDirectory)) {
        console.error(`Root directory does not exist: ${rootDirectory}`);
        return;
    }

    // Read subdirectories in the root directory
    const foldersToMonitor = fs.readdirSync(rootDirectory)
        .map(name => path.join(rootDirectory, name))
        .filter(source => fs.lstatSync(source).isDirectory());

    if (foldersToMonitor.length === 0) {
        console.error(`No subdirectories found in root directory: ${rootDirectory}`);
        return;
    }

    let fileTimestamps = {};

    // Initialize data structures for each folder
    foldersToMonitor.forEach(folder => {
        fileTimestamps[folder] = [];
    });

    // Function to start monitoring
    function monitorFolders() {
        foldersToMonitor.forEach(folder => {
            const watcher = chokidar.watch(path.join(folder, '*.ts'), {
                persistent: true,
                ignoreInitial: false
            });

            watcher.on('add', filePath => {
                const now = Date.now();
                fileTimestamps[folder].push(now);

                // Limit the number of stored timestamps to prevent memory overflow
                if (fileTimestamps[folder].length > 100) 
                {
                    fileTimestamps[folder].shift(); // Remove the oldest timestamp
                }

                // Calculate average time between file additions
                const timestamps = fileTimestamps[folder];
                if (timestamps.length > 1) {
                    const timeDifferences = [];
                    for (let i = 1; i < timestamps.length; i++) {
                        timeDifferences.push(timestamps[i] - timestamps[i - 1]);
                    }
                    const sum = timeDifferences.reduce((a, b) => a + b, 0);
                    const averageTime = sum / timeDifferences.length;

                    // Fetch CPU usage
                    os.cpuUsage(function(v) {
                        console.log(`\n\n\nAverage time for ${folder}: ${(averageTime / 1000).toFixed(2)} seconds`);
                        console.log(`Current CPU Usage: ${(v * 100).toFixed(2)}%`);
                        console.log('---------------------------\n');
                    });
                }
            });

            watcher.on('error', error => {
                console.error(`Watcher error in folder ${folder}: ${error}`);
            });
        });
    }

    // Start monitoring
    monitorFolders();

    // Optional: Set up periodic CPU and Memory usage logging
    setInterval(() => {
        os.cpuUsage(function(cpuPercent) {
            console.log(`CPU Usage: ${(cpuPercent * 100).toFixed(2)}%`);
            console.log(`Free Memory: ${(os.freememPercentage() * 100).toFixed(2)}%`);
            console.log('---------------------------');
        });
    }, 5000); // Adjust the interval as needed
}

module.exports = { startMonitoring };
