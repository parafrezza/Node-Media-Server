// pkg chinaMediaServer node12-win-x64, node12-macos-x64

const NodeMediaServer = require('./node_media_server');
const os              = require("os"); 
const ffmpegFlags  = '[hls_time=2:hls_list_size=20:hls_flags=delete_segments:hls_flags=program_date_time:hls_start_number_source=1]';
const fissionModel = [{
                        ab: "96k",
                        vb: "400k",
                        vs: "424x240",
                        vcParam: ["timecode", "01:02:03:04"],
                        vf: "25"
                      },
                      {
                        ab: "96k",
                        vb: "1000k",
                        vcParam: ["timecode", "01:02:03:04"],
                        vs: "854x480",
                        vf: "25"
                      }];

function ffmpegLocation()
{
  let currentOS = os.type();
  console.log('');
  console.log("siamo su %s", currentOS );
  if      (currentOS == "Darwin") { return "/usr/local/bin/ffmpeg"}
  else if (currentOS == "Windows_NT") { return "C:/ffmpeg/bin/ffmpeg.exe"}
  else {console.log('porcoddò');}

}

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 4000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
	/*
    ssl: {
      port: 443,
      key: './privatekey.pem',
      cert: './certificate.pem',
    }
	*/
  },
  http: {
    port: 8000,
    mediaroot: '../videoTemp/media/',
    webroot: './www',
    allow_origin: '*',
    api: true
  },
  // https: {
  //   port: 8443,
  //   key: './privatekey.pem',
  //   cert: './certificate.pem',
  // },
  trans: {
    ffmpeg: ffmpegLocation(),
    tasks: [
      {
        app: 'live1',
        hls: true,
        hlsFlags: ffmpegFlags
      },
      {
        app: 'live2',
        hls: true,
        hlsFlags: ffmpegFlags
      },
      {
        app: 'live3',
        hls: true,
        hlsFlags:ffmpegFlags 
      },
      {
        app: 'live4',
        hls: true,
        hlsFlags: ffmpegFlags,
      },
      {
        app: 'live5',
        hls: true,
        hlsFlags: ffmpegFlags
      },
      {
        app: 'live6',
        hls: true,
        hlsFlags: ffmpegFlags
      },
      {
        app: 'live7',
        hls: true,
        hlsFlags:ffmpegFlags 
      },
      {
        app: 'live8',
        hls: true,
        hlsFlags:ffmpegFlags
      }      
     ]
  }, 
  fission: {
    ffmpeg: ffmpegLocation(),
    tasks: [
      {
        rule: "live1/*",
        model: fissionModel
      },
      {
        rule: "live2/*",
        model:fissionModel
      },
      {
        rule: "live3/*",
        model: fissionModel
      },
      {
        rule: "live4/*",
        model: fissionModel
      },
      {
        rule: "live5/*",
        model: fissionModel
      },
      {
        rule: "live6/*",
        model: fissionModel
      },
      {
        rule: "live7/*",
        model: fissionModel
      },
      {
        rule: "live8/*",
        model: fissionModel
      }
    ]
  },
  auth: {
    api: true,
    api_user: 'admin',
    api_pass: 'admin',
    play: false,
    publish: false,
    secret: 'nodemedia2017privatekey'
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

//s 0 - b: v: 1024k - bufsize 1024k - maxrate 1024k - minrate 1024k - preset veryfast - profile: v baseline - tune film - g 48 - x264opts no - scenecut - acodec aac - b: a 192k - ac 2 - ar 44100 - af "aresample=async=1:min_hard_comp=0.100000:first_pts=0" - f mp4 output.mp4