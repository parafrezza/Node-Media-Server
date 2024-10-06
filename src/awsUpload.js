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
        maxAsyncS3: 20,     // this is the default
        s3RetryCount: 3,    // this is the default
        s3RetryDelay: 200, // this is the default
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
    // Helper function to upload a file to S3
    function uploadFile(filePath) {
        const fileStream = fs.createReadStream(filePath);
        const key = path.relative(localDir, filePath).replace(/\\/g, '/'); // Normalize for S3
        const params = 
        {
            Bucket: path.posix.join(secchio,remoteDir),
            Key: key,
            Body: fileStream,
        };
        console.log('che metterei nel bucket:\n%s',params.Bucket );

        console.log('il nome del file su S3 sarebbe quindi:\n%s',params.Key );

        s3.upload(params, (err, data) => {
        if (err) {
            console.error(`Durane il watch it -> Error uploading ${filePath}:`, err);
        } else {
            console.log(`Uploaded ${filePath} to ${data.Location}`);
        }
        });
    }

    // Helper function to delete a file from S3
    function deleteFile(filePath) {
        const key = path.relative(localDir, filePath).replace(/\\/g, '/');

        const params = {
        Bucket: path.join(secchio,remoteDir),
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
        if (process.env.SYNCH_DELETE)
        {
            console.log(`File ${filePath} has been removed`);
            deleteFile(filePath);
        }
        })
        .on('error', (error) => {
        console.error(`Watcher error: ${error}`);
        });
}
// module.exports.syncala('champagne', 'pool', 'D:\devss\lo studio della tivvuu\web and alike\regieRemote\videoTemp\media\champagne\')
