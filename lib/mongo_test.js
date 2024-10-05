const path = require('path')
let configs = require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
console.log(configs)
const uri             = configs.parsed.MONGO_URI;
const assert = require("assert");
const { MongoClient } = require("mongodb");
const { log } = require('./node_core_logger');

 
const client = new MongoClient(uri);


const strimmo = 
{ title: 'ciao',
    "description": 'live streaming tests',
    "localURL": '/Users/riccardofrezza/Desktop/video_temp/champagne/ciao_5.m3u8',
    "remoteURL": 'https://s3.eu-central-1.amazonaws.com/extratech.live.dev/champagne/ciao_5.m3u8',
    "numeroVidei": 4,
    "redux": false,
    "reserved": false,
    "placeHolderImage": 'images/ColorBars.jpg',
    "liveDurationInfinity": true,
    "data_di_inizio": 1728141552944
  }

  
  const documento = {
    title: 'dajeForte',
    description: 'live streaming tests',
    localURL: 'C:\\Users\\Riccardo\\Desktop\\video_temp\\champagne\\dajeForte_480.m3u8',
    remoteURL: 'https://s3.eu-central-1.amazonaws.com/extratech.live.dev/champagne/dajeForte_480.m3u8',
    numeroVidei: 4,
    redux: false,
    reserved: false,
    placeHolderImage: 'images/ColorBars.jpg',
    liveDurationInfinity: true,
    data_di_inizio: 1728058247410
  };

const go = async function ()
{
        

    try {
        // Connessione al server
        await client.connect();
        console.log('Connessione a MongoDB riuscita');
        console.log('Ci scrivo il documneo:');
        console.log(strimmo);
        let documentoEsistente = '';
        const db         = client.db(configs.parsed.MONGOBD_INSTANCE);
        const collection = db.collection(configs.parsed.MONGOBD_VIDEO_COLLECTION);
        // Verifica se esiste già un documento con lo stesso 'title'
        console.log( 'Verifica se esiste già un documento col title ' + strimmo.title);
        try
        {
            documentoEsistente = await collection.findOne({ title: documento.title });
        }
            catch(ero)
            {
                console.log('ero cercando documenti esistenti!');
                console.log(ero);
                
        }
        if (documentoEsistente) {
            // Se il documento esiste già, lancia un errore
            throw new Error(`Un documento con il titolo "${strimmo.title}" esiste già.`);
            }
        // Inserimento del nuovo documento
        const risultato = await collection.insertOne(strimmo);
        console.log('Nuovo video aggiunto con _id:', risultato.insertedId);

        return risultato;
    } catch (err) {
        console.error('Errore nell\'aggiungere il nuovo stream:', err);
        throw err;
    } finally {
        // Chiude la connessione al database
        await client.close();
    }
}()
        
 

/*

    con mongosh:
    db.videi.find({ "title": { $regex: "^demo" } })
*/


