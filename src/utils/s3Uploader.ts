import { v4 as uuid } from "uuid";
import fs from "fs";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage"
import logger from "./logger";

const s3Upload = async (file: any) => {
    try {
        const s3 = new S3Client();
        // read the file from the path
        const fileStream = fs.createReadStream(file.filepath);
        // get the file extension from the mimetype
        const contentType = file?.mimetype?.split("/")[1];
        // params for s3 upload
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `files/${uuid()}.${contentType}`,
            Body: fileStream,
        };
        // upload the file to s3
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

const uploadBlob = async (file:any,fileName:string) => {
    try {
        const s3 = new S3Client();
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `files/${fileName}`,
            Body: file,
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
}


export { s3Upload,uploadBlob };