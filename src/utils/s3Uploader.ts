import { S3 } from "aws-sdk";
import { v4 as uuid } from "uuid";
import fs from "fs";
import { PutObjectRequest } from "aws-sdk/clients/s3";
import { ManagedUpload } from "aws-sdk/lib/s3/managed_upload";

const s3Upload = async (file: any) => {
  const s3 = new S3();
  const fileStream = fs.createReadStream(file.filepath);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${uuid()}.${file.originalFilename?.split(".").pop()}`,
    Body: fileStream,
  };


return new Promise((resolve, reject) => {
    s3.upload(params as PutObjectRequest, (err: Error, data: ManagedUpload.SendData) => {
        if (err) {
            reject(err);
        }
        if (data) {
            resolve(data);
        }
    });
});
};

export { s3Upload };