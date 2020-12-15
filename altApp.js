const NodeMediaServer = require('./node_media_server');
const os              = require("os"); 
 
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    mediaroot: '../videoTemp/media',
    allow_origin: '*'
  },
  trans: {
    ffmpeg: ffmpegLocation(),
    tasks: [
      {
        app: 'relay',
        vc: "copy",
        vcParam: [],
        ac: "copy",
        rtmp:true,
        rtmpApp:'live1',
        hls: false,
        hlsFlags: '[hls_time=2:hls_list_size=12:hls_flags=delete_segments]'
      },
      {
        app: 'live1',
        vc: "copy",
        vcParam: [],
        // ac: "aac",
        acParam: ['-an'],
        rtmp:true,
        rtmpApp:'live3',
        hls: false,
        hlsFlags: '[hls_time=2:hls_list_size=12:hls_flags=delete_segments]'
      }
    ]
  }
};
 
var nms = new NodeMediaServer(config)
nms.run();


function ffmpegLocation()
{
  let currentOS = os.type();
  console.log('');
  console.log("siamo su %s", currentOS );
  if      (currentOS == "Darwin") { return "/usr/local/bin/ffmpeg"}
  else if (currentOS == "Windows_NT") { return "C:/ffmpeg/bin/ffmpeg.exe"}
  else {console.log('porcoddò');}

}
