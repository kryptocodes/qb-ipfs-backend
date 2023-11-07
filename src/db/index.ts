import mongoose, { Connection } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.Promise = global.Promise;

if(!process.env.MONGODB_URI) {
    console.log(`No mongo connection string. Set MONGODB_URI environment variable.`);
    process.exit(1);
}

if(!process.env.MONGODB_DBNAME) {
    console.log(`No mongo dbName. Set MONGODB_DBNAME environment variable.`);
    process.exit(1);
}

const connection: Promise<Connection> = mongoose.connect(process.env.MONGODB_URI!, {
    autoIndex: true,
    dbName: process.env.MONGODB_DBNAME,
}).then((mongoose) => mongoose.connection);

connection
    .then(db => {
        console.log(`Successfully connected to dB`);
        return db;
    })
    .catch(err => {
        console.log(err);
        process.exit(1);
    });
    mongoose.set("debug", (collectionName, method, query, doc) => {
        console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
    });

export default connection;
