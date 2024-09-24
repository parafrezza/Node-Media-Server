const path = require('path')
let configs = require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
console.log(configs)
const uri             = configs.parsed.MONGO_URI;

const assert = require("assert");
const { MongoClient } = require("mongodb");

module.exports = 
{
    setNewLiveStream:  async function(strimmo,calba)
    {
        const client = new MongoClient(uri);

        try {
            // Connessione al server
            await client.connect();
            console.log('Connessione a MongoDB riuscita');

            const db         = client.db(configs.parsed.MONGOBD_INSTANCE);
            const collection = db.collection(configs.parsed.MONGOBD_VIDEO_COLLECTION);

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




// const Strimmo = require('./schemas/live_streaming_schema.js'); 
// const uri             = configs.parsed.MONGO_URI;
// console.log(uri)
// // const client          = new MongoClient(uri,
// //                         {
// //                              useNewUrlParser: true,
// //                              useUnifiedTopology: true
// //                         });
// const client = async () => {
//     try {     const conn = await mongoose.connect(uri);   }
//     catch{ero}{console.log(ero)}
//     }
// let database;
// const retryTime        = 1000;
// const retryMaxAttempts = 10;
//   let attemptsCounter  = 0;

// mongo_db_instance    = configs.parsed.MONGOBD_INSTANCE;

// (async function()
// {
//     try
//     {
//         await client.connect(function (err, db) 
//         {
//             if (err) throw err;
//             console.log("Connected to MongoDB!");
//             database = client.db(mongo_db_instance);
//         });
//     }
//     catch(ero)
//     {
//         console.log('non sono riuscito a collegarmi col mongo a causa di questo errore:');
//         console.log(ero);
//     }
// })();


// module.exports = 
// {
// getDb : async function()
// {
//     assert.ok(database, "Db has not been initialized.");
//     return database;
// },
// setNewLiveStream:  async function(strimmo,calba)
// {
//     const inizio = new Date().getTime()
//     async function inseriscilo()
//     {
//         const videi         = database.collection("videi");
//         // const nuovo_strimmo = new Strimmo(strimmo);
//         console.log('inserisco il nuovo stream:');
//         console.log(strimmo);
//         const doc = await nuovo_strimmo.save();
//         calba (doc);
//     }
//     try
//     {
//         (function gogogo()
//         {
//             if(database)  {  inseriscilo();  }
//             else
//             {
//                 attemptsCounter++;
//                 if (attemptsCounter < retryMaxAttempts)
//                 {
//                     console.log('Mongo ain\'t ready yet!\nRetrying in %s for the %s time',retryTime, attemptsCounter);
//                     setTimeout(gogogo, retryTime);
//                 }
//                 else{return}
//             }
//         })()
//     }
//     catch(eroina) { console.log('guarda che provando a scrivere il titolo di un nuovo streaming il DB dice: %s', eroina);    }
//     finally {
//         const tempo = (new Date().getTime() - inizio);
//         console.log('scritto un nuovo titolo, it took %s milliseconds', tempo);
//     }
// }

// }


/*
compass user: rick_compass XJR8XwDGz3fjGKcu
mongoDB account: riccardo@extratechlab.it midqeh-kaxzop-cyJzy5
*/

 