// rf 2021
require('dotenv').config();
const aws     = require('aws-sdk'),
      fs      = require('fs'),
      path    = require('path');

// aws.config.update({region:''})

const s3      = new aws.S3(
          {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
          }
      );

const uploadFile = (nomeFile, secchio) =>
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

// console.log(process.env.AWS_ACCESS_KEY);



uploadFile('./lena72.jpeg', 'yollo')