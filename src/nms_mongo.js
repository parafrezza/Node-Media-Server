const path = require('path')
let configs = require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
console.log(configs)
const uri             = configs.parsed.MONGO_URI;
const assert = require("assert");
const { MongoClient } = require("mongodb");
const { log } = require('./node_core_logger');
const { emitWarning } = require('process');

module.exports = 
{
    setNewLiveStream:  async function(strimmo)
    {
        const client = new MongoClient(uri);

        try {
            // Connessione al server
            await client.connect();
            console.log('Connessione a MongoDB riuscita');
            console.log('Ci scrivo il documneo:');
            console.log(strimmo);
            let documentoEsistente = '';
            const db         = client.db(configs.parsed.MONGODB_INSTANCE);
            const collection = db.collection(configs.parsed.MONGODB_VIDEO_COLLECTION);
            // Verifica se esiste già un documento con lo stesso 'title'
            try
            {
                documentoEsistente = await collection.findOne({ title:strimmo.title});
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
        }
        catch (err) {
            console.warn('Errore nell\'aggiungere il nuovo stream:', err);
            throw err;
        } finally {
            // Chiude la connessione al database
            await client.close();
        }
        
    }
}



/*

    con mongosh:
    db.videi.find({ "title": { $regex: "^demo" } })
*/



// { title: 'ciao',
//     "description": 'live streaming tests',
//     "localURL": '/Users/riccardofrezza/Desktop/video_temp/champagne/ciao_5.m3u8',
//     "remoteURL": 'https://s3.eu-central-1.amazonaws.com/extratech.live.dev/champagne/ciao_5.m3u8',
//     "numeroVidei": 4,
//     "redux": false,
//     "reserved": false,
//     "placeHolderImage": 'images/ColorBars.jpg',
//     "liveDurationInfinity": true,
//     "data_di_inizio": 1728141552944
//   }

