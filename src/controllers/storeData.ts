import { Request, Response } from 'express';
import { s3Upload } from '../utils/s3Uploader';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { putData } from '../services';


/* 
upload: store json | string  in mongodb
@params: file
@returns:  status, message, and hash of the stored file
*/

const upload = async (req: Request, res: Response) => {
    try {
        const { file } = req.body;
        if (!file) return res.status(400).json({ status: "400", message: "file is required" })
        let jsonData = null;
        try{ jsonData = JSON?.parse(file[0]); } catch(error){}
        const uploadToDB = await putData(uuidv4(), jsonData ? jsonData : file[0]);

            if(!uploadToDB) return res.status(400).json({ status: "400", message: "upload failed" })
            return res.status(200).json({
                status: "200",
                message: "file stored successfully",
                hash: uploadToDB?.hash,
            })
    }
    catch (error) {
        logger.error(error)
        return res.status(500).json({
            status: "500",
            message: error?.message || "internal server error"
        })
    }
}

/*
uploadFile: upload file in s3 and store CID in db
@params: file
@returns:  status, message, and hash of the stored file
*/
const uploadFile = async (req: Request | any, res: Response) => {
    try {
        const { file } = req.files;
       if(!file[0]) return res.status(400).json({ status: "400", message: "file is required" })
            const cid: any = await s3Upload(file[0])
            if (!cid || !cid.Location) { return res.status(400).json({ status: "400", message: "upload failed" }) }
            const uploadToDB = await putData(uuidv4(), cid.Location)
            return res.status(200).json({
                status: "200",
                message: "file stored successfully",
                hash: uploadToDB?.hash,
            })
       
    }
    catch (error) {
        logger.error(error)
        return res.status(500).json({
            status: "500",
            message: error?.message || "internal server error"
        })
    }
}







export {
    upload,
    uploadFile
}