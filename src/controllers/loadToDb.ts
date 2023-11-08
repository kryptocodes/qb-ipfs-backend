import { Request, Response } from 'express';
import { s3Upload } from '../utils/s3Uploader';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { findHash,putData } from '../services';


/* 
upload: store json in mongodb
@params: data
@returns:  status, message, and hash of the stored data
*/

const uploadToDB = async (req: Request, res: Response) => {
    
    try {
        let { data,hash } = req.body;
        if (!data) return res.status(400).json({ status: "400", message: "data is required" })
        //if hash is provided, check if it already exists 
         data = JSON?.parse(data) ? JSON?.parse(data) : data
        if(hash && hash.length > 0){
            const duplicateCheck = await findHash(hash);
            if(duplicateCheck){
                return res.status(400).json({ status: "400", message: "hash already exists" })
            }
        }
            const uploadToDB = await putData(hash?.length > 0 ? hash : uuidv4(), data)
            if(!uploadToDB) return res.status(400).json({ status: "400", message: "upload failed" })
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

const uploadFiletoDB = async (req: Request | any, res: Response) => {
    console.log(req.file,req.body)
    try {
        const { data } = req.file;
        const { hash } = req.body;
       if(!data) return res.status(400).json({ status: "400", message: "data is required" })
        //if hash is provided, check if it already exists 
        if(hash && hash[0].length > 0){
            const duplicateCheck = await findHash(hash[0]);
            if(duplicateCheck){
                return res.status(400).json({ status: "400", message: "hash already exists" })
            }
        }
            const cid: any = await s3Upload(data[0])
            if (!cid || !cid.Location) { return res.status(400).json({ status: "400", message: "upload failed" }) }
            const uploadToDB = await putData(hash && hash[0]?.length > 0 ? hash[0] : uuidv4(), cid.Location)
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
    uploadToDB,
    uploadFiletoDB
}