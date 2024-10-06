const path          = require ('path'),
      fs            = require ('fs'),
      chalk         = require ('chalk'),
      avvueseTePrego  = require('./awsUpload'),
      fissionModel  = require ('./fissionModel.json');

module.exports.fammeNaPlaylist = function (args,projectDestination,cibba)
{
  let arghi              = args.split('/');
  let app                = arghi[1];
  let programName        = arghi[2];
  secchiello             = programName;
  let masterPlaylistText = '#EXTM3U\r\n#EXT-X-VERSION:6\r\n';
  let modello = 'standardFissionModel';
  let redux = false;
  console.log('\n\%o.\nlocation: %s',arghi, projectDestination);
  console.log('\n\nridotta?    ' + (app.indexOf('Redux')==-1 ? 'Non è ridotta.':'Yes. E\' ridotta'));
  console.log(chalk.green('\nIl programma di oggi, signori, si chiama '+secchiello));

  if (app.indexOf('Redux') !== -1)
  { 
    modello = 'reduxFissionModel';
    redux=true;
    console.log('applying redux fission model');
  }
  console.log('\nlivellii: %o\n', fissionModel[modello]);
  for (let i=fissionModel[modello].length-1; i>=0; i--)
  {
      let bitrate = parseFloat(fissionModel[modello][i].vb.slice(0,-1)/1000);
      masterPlaylistText += '#EXT-X-STREAM-INF:BANDWIDTH='+(bitrate*1.1).toFixed(2)*1000000+',AVERAGE-BANDWIDTH='+bitrate*1000000+',FRAME-RATE=25,RESOLUTION='+fissionModel[modello][i].vs+',CLOSED-CAPTIONS=NONE,CODECS="avc1.64001e,mp4a.40.2"\r\n';
      masterPlaylistText +=  programName+'_'+fissionModel[modello][i].vs.split('x')[1]+'/index.m3u8\r\n';
  }
  let masterPlaylistName     = path.join( programName + '.m3u8');
  let masterPlaylistFolder   = path.join (projectDestination, app );
  let masterPlaylistLocation = path.join (projectDestination, app, masterPlaylistName );
  // console.log('mi hai chiesto una playlist per %s da mettere %s usando i dati di %o', app, path.join(programName,app), fissionModel[modello]);
  console.log('\nsiccome so bravo te faccio la pleilist \n%s eventualmente da scrivere qui:\n%s\n', masterPlaylistName, masterPlaylistFolder );
  // Check if the directory exists
  if (!fs.existsSync(masterPlaylistFolder))
  {
    // If it doesn't exist, create the directory
    fs.mkdirSync(masterPlaylistFolder);
    console.log(`Directory '${masterPlaylistFolder}' created.`);
  }
  else
  {
    console.log(`Directory '${masterPlaylistFolder}' already exists.`);
  }


  fs.writeFile(masterPlaylistLocation, masterPlaylistText, err => 
  {
      if (err) 
      {
          console.error('scrivendo la master ho preso eroina: \n%o', err)
          cibba(false);
          return
      }
      else
      {
         console.log(chalk.green('\n\nmaster:\r\n%s\n\n',masterPlaylistText));
         console.log(chalk.yellow('\nProvo ad uploadarla prendendola da ' + masterPlaylistLocation));

         avvueseTePrego.upload(masterPlaylistLocation);

         cibba(true);
      }
  });
};