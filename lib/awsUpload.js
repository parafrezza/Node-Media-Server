// rf 2021
require('dotenv').config();
const aws     = require('aws-sdk'),
      fs      = require('fs'),
      path    = require('path');
const { getInfo } = require('../api/controllers/server');
let weHaveABucket = false;

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
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: 'eu-central-1',
            // endpoint: 's3.yourdomain.com',
            // sslEnabled: false
            // any other options are passed to new AWS.S3()
            // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
        },
});
      



module.exports.uploadFile = (nomeFile, secchio) =>
{
    if(weHaveABucket)
    {
        fs.readFile(nomeFile, (eroina, dati) =>
        {
            if(eroina) throw eroina;
            const params = 
            {
                Bucket: secchio,
                Key: path.basename(nomeFile),
                Body:JSON.stringify(dati, null,2)
            };
            s3.upload(params, (s3Err, datas)=>
            {
                if(s3Err) throw s3Err;
                console.log('%s uploaded succesfully at %s', nomeFile, secchio);
            });
        });
    }
    else {throw new console.error('dunno were to put stufff');}
}

module.exports.createBucketIfItDoNotexist = function (args, colbacca)
{
    let arghi              = args.split('/');
//   let app                = arghi[1];
    let buchetto        = arghi[2];
    s3.listBuckets((ero,data)=>{
        if(ero) throw ero;
        else
        {
            console.log('i secchioni:\n%o', data.Buckets);
            for (let buco of data.Buckets)
            {
                if(buco.Name == buchetto)
                {
                    console.log('il buco esiste, non ne serve uno nuovo');
                    weHaveABucket = true;
                    colbacca(false);
                     return
                }
            }
            console.log('ora creerò un bucio nuovo chiamato ' + buchetto);
            s3.createBucket({Bucket: buchetto}, (eroino, dataz)=>{
                if(eroino) throw eroino;
                else
                {
                    console.log('Yes.\n%o', dataz.Location);
                    weHaveABucket = true;

                }
            });
            colbacca(true);
        }
    });
}



module.exports.resetBucket = function(){weHaveABucket=false;}



module.exports.syncala = function (app, programName, mediaFolder )
{
    let upParams =
    {
        localDir: mediaFolder,
        deleteRemoved: true, // default false, whether to remove s3 objects
                         // that have no corresponding local file.
   
        s3Params: 
        {
            Bucket: programName,
            Prefix: app,
            // other options supported by putObject, except Body and ContentLength.
            // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
        },
  };
  let uploader = client.uploadDir(upParams);
  uploader.on('error', function(err) {
    console.error("unable to sync:", err.stack);
  });
  uploader.on('progress', function() {
    console.log("progress", uploader.progressAmount, uploader.progressTotal);
  });
  uploader.on('end', function() {
    console.log("done uploading");
  });
}