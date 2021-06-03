
require('dotenv').config();
const NodeMediaServer = require('./node_media_server');
const os              = require("os"); 
const path            = require("path"); 
const ffmpegFlags     = '[hls_time=2:hls_list_size=30:hls_flags=delete_segments:hls_flags=program_date_time:hls_start_number_source=generic]';
const perFavore       = require('./masterPlaylistMaker');
const avvueseTePrego  = require('./awsUpload');
const fissionModel    = require('./fissionModel.json');
const location        = process.env.VIDEO_TEMP;
avvueseTePrego.settaLaVideoTemp(location);
const ffmpegLocation  = findFfmpegLocation();

const IS_DEBUG = process.env.NODE_ENV === 'development';
console.log('is debug is '+ IS_DEBUG);

const config = {
  rtmp: {
    port: 1936,
    chunk_size: 4000,
    gop_cache: true,
    ping: 25,
    ping_timeout: 50
    // ssl: {
    //   port: 9443,
    //   key: './privatekey.pem',
    //   cert: './certificate.pem',
    // }
  },
  http: {
    port: 9000,
    mediaroot: location,
    webroot: location,
    allow_origin: '*',
    api: true
  },
  // https: {
  //   port: 8443,
  //   key: './privatekey.pem',
  //   cert: './certificate.pem',
  // },
  trans:
   {
    ffmpeg: ffmpegLocation,
    tasks: [
      {
        app: 'champagne',
        vc: "copy",
        ac: "copy",
        hls: true,
        hlsFlags: ffmpegFlags
      },
      {
        app: 'champagneRedux',
        vc: "copy",
        ac: "copy",
        hls: true,
        hlsFlags: ffmpegFlags
      },
      {
        app: 'record',
        mp4: true,
        mp4Flags: '[movflags=frag_keyframe+empty_moov]',
      }
     ]
  }, 
  fission: {
    ffmpeg: findFfmpegLocation(),
    tasks: [
      {
        rule: "champagne/*",
        model: fissionModel.standardFissionModel
      },
      {
        rule: "champagneRedux/*",
        model: fissionModel.reduxFissionModel
      }
    ]
  },
  auth: {
    api: true,
    api_user: process.env.API_USER,
    api_pass: process.env.API_PASS,
    play: false,
    publish: false,
    secret: process.env.API_SECRET
  } 
};
let isMasterPlaylistDone = false;
let isBucketDone         = false;


let nms = new NodeMediaServer(config)
nms.run();
nms.on('preConnect', (id, args) => {
  console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
  // let session = nms.getSession(id);
  // session.reject();
  // console.log(args);
});
nms.on('postConnect', (id, args) => {
  console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
});
nms.on('doneConnect', (id, args) => {//sconnessione
  console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
  isMasterPlaylistDone = false;
  isBucketDone= false;
});
nms.on('prePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  if(!isMasterPlaylistDone)
  {
    perFavore.fammeNaPlaylist(StreamPath, location,
    (done)=>
    {
      console.log('done? ' + done);
      isMasterPlaylistDone = done;
      if(!isBucketDone)
      {
        avvueseTePrego.createBucketIfItDoNotexist(StreamPath,
        (done)=>
        {
          console.log('done? ' + done);
          isBucketDone = true;
        });
      }
    });
  }

  let sp                 = StreamPath.split('/');
  let app                = sp[1];
  let programName        = sp[2];
  let programDirectory   = path.join(location, app, programName)
  // avvueseTePrego.syncala(app, programName, programDirectory)
});
nms.on('postPublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});
nms.on('donePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});
nms.on('prePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);

});
nms.on('postPlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});
nms.on('donePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});
function findFfmpegLocation()
{
  let currentOS = os.type();
  console.log('');
  console.log("siamo su %s", currentOS );
  if      (currentOS == "Darwin")     { return "/usr/local/bin/ffmpeg"}
  else if (currentOS == "Windows_NT") { return "C:/ffmpeg/bin/ffmpeg.exe"}
  else if (currentOS == "Linux")  {return "/usr/bin/ffmpeg"}
  else {console.log('porcoddò');}
}
(function areWeProducing()
{
  console.log('porco '+ process.env.PORCO);
  if (process.env.NODE_ENV=='development') {console.log('Development!'); return false;}
  else {return true;}
})()

/*
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-STREAM-INF:BANDWIDTH=15000000,AVERAGE-BANDWIDTH=14000000,RESOLUTION=3840x2160,CLOSED-CAPTIONS=NONE,CODECS="avc1.42e00a,mp4a.40.2"
/media/champagne/feed1/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=4800000,AVERAGE-BANDWIDTH=4500000,RESOLUTION=1920x1080,CLOSED-CAPTIONS=NONE,CODECS="avc1.42e00a,mp4a.40.2"
/media/champagne/feed1_1080/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=3500000,AVERAGE-BANDWIDTH=3000000,RESOLUTION=1280x720,CLOSED-CAPTIONS=NONE,CODECS="avc1.42e00a,mp4a.40.2"
/media/champagne/feed1_720/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1100000,AVERAGE-BANDWIDTH=1000000,RESOLUTION=854x480,CLOSED-CAPTIONS=NONE,CODECS="avc1.42e00a,mp4a.40.2"
/media/champagne/feed1_480/index.m3u8
*/

// pkg chinaMediaServer node12-win-x64, node12-macos-x64
//C:\Program Files\Apache24\bin> .\httpd.exe

/*
 ssh -i "coppiaEC2extratech.pem" bitnami@ec2-18-198-127-231.eu-central-1.compute.amazonaws.com




*/