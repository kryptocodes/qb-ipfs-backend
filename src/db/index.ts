import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();



if (!process.env.MONGODB_URI) {
   throw new Error('No Mongo connection string. Set MONGODB_URI environment variable.');
}

if (!process.env.MONGODB_DBNAME) {
    throw new Error('No Mongo db name . Set MONGODB_DBNAME environment variable.');
}

const connectToMongoDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI!, {
            autoIndex: true,
            dbName: process.env.MONGODB_DBNAME,
        });
        logger.info(`Connected to mongo database: ${process.env.MONGODB_DBNAME}`);
        mongoose.set("debug", (collectionName, method, query, doc) => {
            logger.info(`${collectionName}.${method}`, JSON.stringify(query), doc);
        });
        return connection;
    } catch (err) {
        logger.error(err);
        process.exit(1);
    }
};

export default connectToMongoDB();
