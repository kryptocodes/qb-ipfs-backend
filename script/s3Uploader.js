const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client } = require("@aws-sdk/client-s3");

const s3Upload = async (file,fileName) => {
    try {
        console.log("uploading to s3", file, fileName)
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
        console.log(error);
        return error;
    }
};


module.exports = { s3Upload };