import { Request, Response } from 'express';
import { Ipfs } from '../models/ipfs';
import { s3Upload } from '../utils/s3Uploader';
import fs from 'fs';
import logger from '../utils/logger';


/* 
storeData: store files in s3 or store data in mongodb
@params: file or data
@returns: hash of the file or data
*/

const storeData = async (req: Request | any, res: Response) => {
    // keeping both data and file in same api for ease of use 
    const { data: file } = req.file;
    const { data } = req.body;
    try {

        if (!data && !file) return res.status(400).json({ status: "400", message: "data is required" })
        // if data & file both are present then return error
        if (data && file) return res.status(400).json({ status: "400", message: "please provide either data or file" })

        if (file) {
            const cid: any = await s3Upload(file[0])
            logger.info(cid)
            if (!cid || !cid.Location) {
                await fs.unlinkSync(data[0]?.filepath)
                return res.status(400).json({
                    status: "400",
                    message: "upload failed"
                })
            }
            const ipfs = await Ipfs.create({
                data: cid.Location,
            })
            if (!ipfs) return res.status(400).json({ status: "400", message: "upload failed" })
            await fs.unlinkSync(data[0]?.filepath)
            return res.status(200).json({
                status: "200",
                message: "data stored successfully",
                hash: ipfs.hash,
            })
        } else {
            const ipfs = await Ipfs.create({
                data
            })
            if (!ipfs) return res.status(400).json({ status: "400", message: "upload failed" })
            return res.status(200).json({
                status: "200",
                message: "data stored successfully",
                hash: ipfs.hash,
            })
        }
    }
    catch (error) {
        await fs.unlinkSync(data[0]?.filepath)
        logger.error(error)
        return res.status(500).json({
            status: "500",
            message: error?.message || "internal server error"
        })
    }
}



export {
    storeData
}