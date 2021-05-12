// rf 2021
require('dotenv').config();
const aws      = require('aws-sdk'),
      fs       = require('fs'),
      path     = require('path'),
      chokidar = require('chokidar'),
      os       = require('os');

const { getInfo } = require('../api/controllers/server');
const delimiter =  (os.platform()=="win32") ? "\\" : "/";
let weHaveABucket = false;
let secchio       = process.env.S3_UPLOAD_BUCKET; //il bucket principale
var secchiello    = undefined; //il prefisso del singolo streaming
let videoTemp     = process.env.VIDEO_TEMP; // la cartella locale
let watcher       = undefined;

aws.config.update({region:'eu-central-1'})

const s3      = new aws.S3(
          {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
          }
      );
const s3Client = require('s3-node-client');
const client = s3Client.createClient(
    {
        maxAsyncS3: 20,     // this is the default
        s3RetryCount: 3,    // this is the default
        s3RetryDelay: 1000, // this is the default
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
         console.log('io invece vorrei uplodare su %s', namo);
         const subdir = namo.split('/')[0]
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
    // let arghi              = args.split('/');
    // let buchetto           = arghi[2];
    // console.log('gli arghi: %o', args);
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
                console.log(eroico);

            }
          
        }
    });
}
module.exports.resetBucket = function(){weHaveABucket=false;}

module.exports.syncala = function (app, programName, fileName )
{
   
    fs.readFile(fileName, (err, data) =>
    {
        if (err) throw err;
        const params = {
            Bucket: 'testBucket', // pass your bucket name
            Key: 'contacts.csv', // file will be saved as testBucket/contacts.csv
            Body: JSON.stringify(data, null, 2)
        };
        s3.upload(params, function(s3Err, data) {
            if (s3Err) throw s3Err
            console.log(`File uploaded successfully at ${data.Location}`)
        });
    });
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
    const cartellaOssservata = path.join(videoTemp, args.split('/')[1]);
    console.log('osserverei %s', cartellaOssservata);
    watcher = chokidar.watch(cartellaOssservata,
    {
        ignored: '*.txt',
        ignoreInitial: true,
        followSymlinks: false,
        cwd: '.',
        awaitWriteFinish: {
            stabilityThreshold: 3000,
            pollInterval: 70
          }
    })
    .on('add', ( patto) =>
        {
        console.log('si aggiunge '+ patto);
        module.exports.upload(patto);
        })
    .on('change', (patto) =>
    {
        if(path.extname(patto) === '.m3u8')
        {
            module.exports.upload(patto);
       // console.log('\ncambia '+ patto);

        }
    });
}
// module.exports.syncala('champagne', 'pool', 'D:\devss\lo studio della tivvuu\web and alike\regieRemote\videoTemp\media\champagne\')
