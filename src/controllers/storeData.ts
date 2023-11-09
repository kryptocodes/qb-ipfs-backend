import { Request, Response } from 'express';
import { uploadBlob } from '../utils/s3Uploader';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { putData } from '../services';
import { errorHandler } from '../handlers/errorHandler';

import fs from "fs";

const uploadHandler = async (req: Request | any, res: Response) => {
    try{
        const { file:data } = req.body;
        const { file } = req.files;
        if(!data && !file) errorHandler(res,400,"either file or text is required")
        if(data && file) errorHandler(res,400,"either file or text is required")
        if(data){ upload(req,res) }
        if(file){ uploadFile(req,res) }
    }
    catch(error){
        logger.error(error)
        errorHandler(res,500,error?.message || "internal server error")
    }
}


/* 
upload: store json | string  in mongodb
@params: file
@returns:  status, message, and hash of the stored file
*/

const upload = async (req: Request, res: Response) => {
    try {
        const { file } = req.body;
        if (!file) errorHandler(res,400,"file is required")
        let jsonData = null;
        try{ jsonData = JSON?.parse(file[0]); } catch(error){}
        const uploadToDB = await putData(uuidv4(), jsonData ? jsonData : file[0]);

            if(!uploadToDB) errorHandler(res,400,"upload failed")
            return res.status(200).json({
                status: "200",
                message: "file stored successfully",
                hash: uploadToDB?.hash,
            })
    }
    catch (error) {
        logger.error(error)
        errorHandler(res,500,error?.message || "internal server error")
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
       if(!file[0]) errorHandler(res,400,"file is required")
            const fileStream = fs.createReadStream(file[0].filepath);
            // get the file extension from the mimetype
            const contentType = file?.mimetype?.split("/")[1];
            const fileName = `${uuidv4()}.${contentType}`
            // upload file to s3
            const cid: any = await uploadBlob(fileStream,fileName)

            // get location from cid
            if (!cid || !cid.Location) { errorHandler(res,400,"upload failed") }
            // store cid in db
            const uploadToDB = await putData(uuidv4(), cid.Location)
            return res.status(200).json({
                status: "200",
                message: "file stored successfully",
                hash: uploadToDB?.hash,
            })  
    }
    catch (error) {
        logger.error(error)
        errorHandler(res,500,error?.message || "internal server error")
    }
}







export {
   uploadHandler,
}