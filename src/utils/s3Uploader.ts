import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage"
import logger from "./logger";


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


export { uploadBlob };