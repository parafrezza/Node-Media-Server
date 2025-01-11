// rf 2021
require('dotenv').config();
const aws      = require('aws-sdk'),
      fs       = require('fs'),
      path     = require('path'),
      chokidar = require('chokidar'),
      os       = require('os');

const { getInfo } = require('./api/controllers/server');
const delimiter =  (os.platform()=="win32") ? "\\" : "/";
let weHaveABucket = false;
let secchio       = process.env.S3_UPLOAD_BUCKET; //il bucket principale
var secchiello    = undefined;                    //il prefisso del singolo streaming
let videoTemp     = process.env.VIDEO_TEMP;       // la cartella locale
let watcher       = undefined;

aws.config.update({region:'eu-central-1'})

const s3      = new aws.S3(
          {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
          }
      );
const s3Client = require('s3-node-client');
const { log }  = require('console');
const client = s3Client.createClient(
    {
        maxAsyncS3: 10,     // this is the default
        s3RetryCount: 2,    // this is the default
        s3RetryDelay: 60, // this is the default
        multipartUploadThreshold: 20971520, // this is the default (20 MB)
        multipartUploadSize: 15728640, // this is the default (15 MB)
        s3Options: {
            accessKeyId:     process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region:          process.env.AWS_REGION,
            // endpoint: 's3.yourdomain.com',
            // sslEnabled: false
            // any other options are passed to new AWS.S3()
            // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
        },
});
      

module.exports.upload = (nomeFile) =>
{
    if(weHaveABucket)
    {
        console.log('chiedi l\'upload %s nel secchio %s', nomeFile, secchio);
        const dname = path.normalize(path.dirname(nomeFile)).split(delimiter).pop();
        let namo;
        if(dname==='champagne' || dname === 'champagneRedux')
        { 
            namo  =   path.basename(nomeFile)
            // namo  = secchio + '/' + path.basename(nomeFile)
        }
        else
        {
            namo  =   dname + '/' + path.basename(nomeFile);
            // namo  = secchio + '/' + dname + '/' + path.basename(nomeFile);
        }
         const subdir = namo.split('/')[0]
         console.log('l\'upload avverrà su %s', subdir);

        if (subdir === secchiello)
        {
            console.log('ma se mi chiedi di uploadare su %s non ti calcolo', subdir);
        }

        fs.readFile(nomeFile, (eroina, dati) =>
        {
            if(eroina) throw eroina;
            const params = 
            {
                Bucket: secchio,
                Key: namo,
                Body:dati
            };
            path.extname(nomeFile)==='.ts' ? params.Metadata = {"Content-Type": "application/x-mpegURL"} :  params.Metadata = {"Content-Type": "video/MP2T"} 
            s3.upload(params, (s3Err, datas)=>
            {
                if(s3Err) throw s3Err;
                console.log('%s uploaded succesfully at %s', namo, secchio);
            });
        });
    }
    else
    {
        console.error('\ndunno were to put stufff, retrying in 1 sec');
        setTimeout(()=>{module.exports.upload(nomeFile)}, 1000);
    }
}

module.exports.createBucketIfItDoNotexist = function (args, colbacca)
{
    let arghi              = args.split('/');
    let buchetto           = arghi[2];
    console.log('gli arghi del createBucket: %o', args);
    console.log('controllo se il buckot %s esista su aws', secchio);
    s3.listBuckets((ero,data)=>{
        if(ero) throw ero;
        else
        {
            console.log('i secchioni:\n%o', data.Buckets);
            for (let buco of data.Buckets)
            {
                if(buco.Name === secchio)
                {
                    console.log('il buco esiste, non ne serve uno nuovo');
                    weHaveABucket = true;
                    watchIt(args);

                    colbacca(false);
                     return
                }
            }
            console.log('Il buco non esiste, creo il buco ' + secchio);
            try
            {
                s3.createBucket({Bucket: secchio}, (eroino, dataz)=>{
                    if(eroino) throw eroino;
                    else
                    {
                        console.log('Yes.\n%o', dataz.Location);
                        weHaveABucket = true;
                        watchIt(args);
                        colbacca(true);
                        
                    }
                });
            }
            catch(eroico)
            {
                console.log();
                console.log(eroico);

            }
          
        }
    });
}
module.exports.resetBucket = function(){weHaveABucket=false;}

module.exports.syncala = function (app, programName, fileName )
{
    // fs.readFile(fileName, (err, data) =>
    // {
    //     if (err)
    //     {   
    //         console.log('mi sa che ho errato provando a leggere i file da syncare:');
    //         console.log(err)
    //         throw err;
    //     }
    //     let params = {
    //         Bucket: secchio, // pass your bucket name
    //         Key: filename, // file will be saved as testBucket/contacts.csv
    //         // Body: JSON.stringify(data, null, 2)
    //     };
    //     s3.upload(params, function(s3Err, data) {
    //         if (s3Err) throw s3Err
    //         console.log(`File uploaded successfully at ${data.Location}`)
    //     });
    // });
}
module.exports.settaLaVideoTemp = function(videoTempDirectory)
{
    videoTemp = videoTempDirectory;
}
module.exports.chiudiIlWatch = function ()
{
    watcher.close().then(() => console.log('Ho chiuso.'));
}

const watchIt = function(args)
{
 
    console.log(args); // mi darà il path dello streaming -> tipo /champagne/dajeforte
    let localDir = path.join(videoTemp, args.split('/')[1]);
    let remoteDir = localDir.split(path.sep).pop()
    console.log('osserverei %s\ne la uploaderei nella directory:\n%s\n\n', localDir, remoteDir);
 
    // Start watching the directory
    const watcher = chokidar.watch(localDir, {
        ignored: /(^|[\/\\])\../, // Ignore dotfiles
        persistent: true,
        ignoreInitial: false, // Process files already existing
    });

    let addCount = 0;
    let changeCount = 0;
    let unlinkCount = 0;

    // Variables to accumulate counts over a minute
    let minuteAddCount = 0;
    let minuteChangeCount = 0;
    let minuteUnlinkCount = 0;

    // Counters for uploads
    let uploadedCount = 0;
    let minuteUploadedCount = 0;

    // Counters for deletions from S3
    let deletedFromS3Count = 0;
    let minuteDeletedFromS3Count = 0;

    // **Total counters**
    let totalAddCount = 0;
    let totalChangeCount = 0;
    let totalUnlinkCount = 0;
    let totalUploadedCount = 0;
    let totalDeletedFromS3Count = 0;

    // **Data uploaded counters**
    let uploadedDataBytes = 0;
    let minuteUploadedDataBytes = 0;
    let totalUploadedDataBytes = 0;

    // Counter to keep track of seconds elapsed
    let secondCounter = 0;

    watcher
        .on('add', (filePath) => {
            addCount++;
            totalAddCount++;
            uploadFile(filePath);
        })
        .on('change', (filePath) => {
            changeCount++;
            totalChangeCount++;
            uploadFile(filePath);
        })
        .on('unlink', (filePath) => {
            if (process.env.SYNCH_DELETE) {
                unlinkCount++;
                totalUnlinkCount++;
                deleteFile(filePath);
            }
        })
        .on('error', (error) => {
            console.error(`Watcher error: ${error}`);
        });

    // Log counts every second and accumulate for minute average
    const intervalId = setInterval(() => {
        if (
            addCount           > 0 ||
            changeCount        > 0 ||
            unlinkCount        > 0 ||
            uploadedCount      > 0 ||
            deletedFromS3Count > 0 ||
            uploadedDataBytes  > 0
        ) {
            const uploadedDataMegabits = (uploadedDataBytes * 8) / 1_000_000; // Convert bytes to megabits
            console.log(
                `Files added: ${addCount}, changed: ${changeCount}, removed: ${unlinkCount}, uploaded: ${uploadedCount}, deleted from S3: ${deletedFromS3Count}, data uploaded: ${uploadedDataMegabits.toFixed(2)} Mb`
            );
        }

        // Accumulate counts for minute average
        minuteAddCount           += addCount;
        minuteChangeCount        += changeCount;
        minuteUnlinkCount        += unlinkCount;
        minuteUploadedCount      += uploadedCount;
        minuteDeletedFromS3Count += deletedFromS3Count;
        minuteUploadedDataBytes  += uploadedDataBytes;

        // Reset the per-second counts
        addCount           = 0;
        changeCount        = 0;
        unlinkCount        = 0;
        uploadedCount      = 0;
        deletedFromS3Count = 0;
        uploadedDataBytes  = 0;

        secondCounter++;

        // Every 60 seconds, calculate and log the average and total counts
        if (secondCounter >= 60) {
            const avgAdd                  = (minuteAddCount           / 60).toFixed(2);
            const avgChange               = (minuteChangeCount        / 60).toFixed(2);
            const avgUnlink               = (minuteUnlinkCount        / 60).toFixed(2);
            const avgUploaded             = (minuteUploadedCount      / 60).toFixed(2);
            const avgDeletedFromS3        = (minuteDeletedFromS3Count / 60).toFixed(2);
            const avgUploadedDataMegabits = ((minuteUploadedDataBytes * 8) / 1_000_000 / 60).toFixed(2);

            const totalUploadedDataMegabits = (totalUploadedDataBytes * 8) / 1_000_000;

            console.log(`\nSummary over the last minute:`);
            console.log(
                `Average per second - Files added: ${avgAdd}, changed: ${avgChange}, removed: ${avgUnlink}, uploaded: ${avgUploaded}, deleted from S3: ${avgDeletedFromS3}, data uploaded: ${avgUploadedDataMegabits} Mb`
            );

            console.log(`Total counts:`);
            console.log(
                `Files added: ${totalAddCount}, changed: ${totalChangeCount}, removed: ${totalUnlinkCount}, uploaded: ${totalUploadedCount}, deleted from S3: ${totalDeletedFromS3Count}, total data uploaded: ${totalUploadedDataMegabits.toFixed(2)} Mb\n`
            );

            // Reset minute counters and second counter
            minuteAddCount           = 0;
            minuteChangeCount        = 0;
            minuteUnlinkCount        = 0;
            minuteUploadedCount      = 0;
            minuteDeletedFromS3Count = 0;
            minuteUploadedDataBytes  = 0;
            secondCounter            = 0;
        }
    }, 1000);

    // Upload function
    function uploadFile(filePath) {
        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error(`Error getting file stats for ${filePath}:`, err);
                return;
            }

            const fileSizeBytes = stats.size;
            const fileStream = fs.createReadStream(filePath);
            const key = path.relative(localDir, filePath).replace(/\\/g, '/'); // Normalize for S3
            const params = {
                Bucket: path.posix.join(secchio, remoteDir),
                Key: key,
                Body: fileStream,
            };

            s3.upload(params, (err, data) => {
                if (err) {
                    console.error(`Error uploading ${filePath}:`, err);
                } else {
                    // Successful upload
                    uploadedCount++; // Increment per-second counter
                    totalUploadedCount++; // Increment total counter

                    // Update data uploaded counters
                    uploadedDataBytes += fileSizeBytes;
                    minuteUploadedDataBytes += fileSizeBytes;
                    totalUploadedDataBytes += fileSizeBytes;
                }
            });
        });
    }

    // Helper function to delete a file from S3
    function deleteFile(filePath) {
        const key = path.relative(localDir, filePath).replace(/\\/g, '/');

        const params = {
            Bucket: path.posix.join(secchio, remoteDir),
            Key: key,
        };

        s3.deleteObject(params, (err, data) => {
            if (err) {
                console.error(`Error deleting ${filePath} from S3:`, err);
            } else {
                // Successful deletion
                deletedFromS3Count++; // Increment per-second counter
                totalDeletedFromS3Count++; // Increment total counter
            }
        });
    }


    
}
// module.exports.syncala('champagne', 'pool', 'D:\devss\lo studio della tivvuu\web and alike\regieRemote\videoTemp\media\champagne\')
