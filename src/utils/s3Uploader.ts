import { v4 as uuid } from "uuid";
import fs from "fs";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage"
import logger from "./logger";

const s3Upload = async (file: any) => {
    try {
        const s3 = new S3Client();
        const fileStream = fs.createReadStream(file.filepath);
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${uuid()}.${file.originalFilename?.split(".").pop()}`,
            Body: fileStream,
        };
        const s3Upload = new Upload({
            client: s3,
            params,
        });

        const upload = await s3Upload.done();
        return upload;
    } catch (error) {
        logger.error(error)
        return error;
    }
};


export { s3Upload };