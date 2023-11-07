import { Request, Response } from 'express';
import { s3Upload } from '../utils/s3Uploader';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { putData } from '../services';


/* 
upload: store json in mongodb
@params: data
@returns:  status, message, and hash of the stored data
*/

const upload = async (req: Request, res: Response) => {
    try {
        const { data } = req.body;
        if (!data) return res.status(400).json({ status: "400", message: "data is required" })

            const uploadToDB = await putData(uuidv4(), data)
            if(!uploadToDB) return res.status(400).json({ status: "400", message: "upload failed" })
            return res.status(200).json({
                status: "200",
                message: "data stored successfully",
                hash: uploadToDB?.hash,
            })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            status: "500",
            message: error?.message || "internal server error"
        })
    }
}

const uploadFile = async (req: Request | any, res: Response) => {
    try {
        const { data } = req.file;
       if(!data) return res.status(400).json({ status: "400", message: "data is required" })
            const cid: any = await s3Upload(data[0])
            if (!cid || !cid.Location) { return res.status(400).json({ status: "400", message: "upload failed" }) }
            const uploadToDB = await putData(uuidv4(), cid.Location)
            return res.status(200).json({
                status: "200",
                message: "data stored successfully",
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