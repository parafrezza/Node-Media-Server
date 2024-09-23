require('dotenv').config();

const AWS = require('aws-sdk');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

// AWS Configuration
AWS.config.update({
    accessKeyId:     process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region:          process.env.AWS_REGION
});

// Create S3 service object
const s3 = new AWS.S3();

// Define your local directory and S3 bucket name
const localDirectory = process.env.VIDEO_TEMP; 
const bucketName = process.env.S3_UPLOAD_BUCKET;

// Function to synchronize directory to S3
function syncDirectoryToS3(localDir, bucket) {
  // Helper function to upload a file to S3
  function uploadFile(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const key = path.relative(localDir, filePath).replace(/\\/g, '/'); // Normalize for S3

    const params = {
      Bucket: bucket,
      Key: key,
      Body: fileStream,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.error(`Error uploading ${filePath}:`, err);
      } else {
        console.log(`Uploaded ${filePath} to ${data.Location}`);
      }
    });
  }

  // Helper function to delete a file from S3
  function deleteFile(filePath) {
    const key = path.relative(localDir, filePath).replace(/\\/g, '/');

    const params = {
      Bucket: bucket,
      Key: key,
    };

    s3.deleteObject(params, (err, data) => {
      if (err) {
        console.error(`Error deleting ${filePath} from S3:`, err);
      } else {
        console.log(`Deleted ${filePath} from S3`);
      }
    });
  }

  // Start watching the directory
  const watcher = chokidar.watch(localDir, {
    ignored: /(^|[\/\\])\../, // Ignore dotfiles
    persistent: true,
    ignoreInitial: false, // Process files already existing
  });

  watcher
    .on('add', (filePath) => {
      console.log(`File ${filePath} has been added`);
      uploadFile(filePath);
    })
    .on('change', (filePath) => {
      console.log(`File ${filePath} has been changed`);
      uploadFile(filePath);
    })
    .on('unlink', (filePath) => {
      console.log(`File ${filePath} has been removed`);
      deleteFile(filePath);
    })
    .on('error', (error) => {
      console.error(`Watcher error: ${error}`);
    });
}

// Start the synchronization
syncDirectoryToS3(localDirectory, bucketName);
