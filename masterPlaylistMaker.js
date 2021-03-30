const path          = require ('path'),
      fs            = require ('fs'),
      chalk         = require ('chalk'),
      fissionModel  = require ('./fissionModel.json');
let app, location;
module.exports.datiPerlaPlaylist = function (nomeFlusso, locationScelta)
{
    app = nomeFlusso;
    location = locationScelta;
}
module.exports.fammeNaPlaylist = function (patto)
{
    

    let masterPlaylistText   = '#EXTM3U\r\n#EXT-X-VERSION:6\r\n';
    let modello = 'standardFissionModel';
    let redux = false;
    console.log('porco dio: ' + app.indexOf('Redux'));

    if (app.indexOf('Redux') === -1)
    { 
      modello = 'reduxFissionModel';
      redux=true;
      console.log('è ridotta!');
    }
      console.log('\n\ni livelli eccoli: %o\n\n', fissionModel[modello]);
    for (let level of fissionModel[modello])
    {
        let bitrate = parseInt(level.vb.slice(0,-1)/1000);
    
        masterPlaylistText += '#EXT-X-STREAM-INF:BANDWIDTH='+(bitrate*1.1).toFixed(2)*1000000+',AVERAGE-BANDWIDTH='+bitrate*1000000+',FRAME-RATE=25,RESOLUTION='+level.vs+',CLOSED-CAPTIONS=NONE,CODECS="avc1.64001e,mp4a.40.2"\r\n';
        masterPlaylistText += programName+'_'+level[1]+'p/index.m3u8\r\n';
    }
    let masterPlaylistName = path.join(location, app , programName + '.m3u8');
    console.log('mi hai chiesto una playlist per %s da mettere %s usando i dati di %o', app, path.join(location,app), fissionModel[modello]);
    console.log('tiè:');
    console.log('siccome so bravo te faccio la pleilist \n%s eventualmente da scrivere qui:\n%s', masterPlaylistText, masterPlaylistName );
    
};