// pkg chinaMediaServer node12-win-x64, node12-macos-x64
//C:\Program Files\Apache24\bin> .\httpd.exe

const NodeMediaServer = require('./node_media_server');
const os              = require("os"); 
const ffmpegFlags  = '[hls_time=2:hls_list_size=30:hls_flags=delete_segments:hls_flags=program_date_time:hls_start_number_source=datetime]';

const fissionModel = [
  {
    ab: "128k",
    vb: "14000k",
    vs: "3840x1440",
    vf: "25",
  },
  {
    ab: "128k",
    vb: "4500k",
    vs: "1920x720",
    vf: "25",
  },
  {
    ab: "128k",
    vb: "3000k",
    vs: "1280x480",
    vf: "25",
  },
  {
    ab: "96k",
    vb: "1000k",
    vs: "854x320",
    vf: "25",
  }
];

function ffmpegLocation()
{
  let currentOS = os.type();
  console.log('');
  console.log("siamo su %s", currentOS );
  if      (currentOS == "Darwin") { return "/usr/local/bin/ffmpeg"}
  else if (currentOS == "Windows_NT") { return "C:/ffmpeg/bin/ffmpeg.exe"}
  else if (currentOS == "Linux")     {return "/usr/bin/ffmpeg"}
  else {console.log('porcoddò');}

}

const config = {
  rtmp: {
    port: 1936,
    chunk_size: 4000,
    gop_cache: true,
    ping: 25,
    ping_timeout: 50,
    ssl: {
      port: 9443,
      key: './privatekey.pem',
      cert: './certificate.pem',
    }
  },
  http: {
    port: 9000,
    mediaroot: '../videoTemp/media/',
    webroot: '../videoTemp/media/',
    allow_origin: '*',
    api: true
  },
  https: {
    port: 8443,
    key: './privatekey.pem',
    cert: './certificate.pem',
  },
  trans: {
    ffmpeg: ffmpegLocation(),
    tasks: [
      {
        app: 'champagne',
        hls: true,
        hlsFlags: ffmpegFlags
      }    
     ]
  }, 
  fission: {
    ffmpeg: ffmpegLocation(),
    tasks: [
      {
        rule: "champagne/*",
        model: fissionModel
      }
    ]
  },
  auth: {
    api: true,
    api_user: 'riccardo',
    api_pass: 'extratech',
    play: false,
    publish: false,
    secret: 'extratech'
  } 
};


let nms = new NodeMediaServer(config)
nms.run();

nms.on('preConnect', (id, args) => {
  console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on('postConnect', (id, args) => {
  console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('doneConnect', (id, args) => {
  console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('prePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('prePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on('postPlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});



/*    {
  ab: "96k",
  vb: "1000k",
  vs: "854x480",
  vf: "25"
}*/

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