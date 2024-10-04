const path = require('path')
let configs = require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
console.log(configs)
const uri             = configs.parsed.MONGO_URI;

const assert = require("assert");
const { MongoClient } = require("mongodb");

module.exports = 
{
    setNewLiveStream:  async function(strimmo)
    {
        const client = new MongoClient(uri);

        try {
            // Connessione al server
            await client.connect();
            console.log('Connessione a MongoDB riuscita');

            const db         = client.db(configs.parsed.MONGOBD_INSTANCE);
            const collection = db.collection(configs.parsed.MONGOBD_VIDEO_COLLECTION);
            // Verifica se esiste già un documento con lo stesso 'title'
            const documentoEsistente = await collection.findOne({ title: strimmo.title });
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
        
    }
}



/*

    con mongosh:
    db.videi.find({ "title": { $regex: "^daje" } })
    