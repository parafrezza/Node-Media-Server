// rf 2021
require('dotenv').config();
const aws     = require('aws-sdk'),
      fs      = require('fs'),
      path    = require('path');
const { getInfo } = require('../api/controllers/server');
let weHaveABucket = false;

<<<<<<< HEAD
aws.config.update({region:'eu-central-1'})
=======
// aws.config.update({region:''})
>>>>>>> d281b1ee38e2dcf77b8b83e216cb8afe4bd4d301

const s3      = new aws.S3(
          {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
          }
      );

module.exports.uploadFile = function (nomeFile, secchio) =>
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

module.exports.createBucketIfItDoNotexist = function (buchetto, colbacca)
{
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



