import { Request, Response } from "express";
import logger from "../utils/logger";
import { fetchData } from "../services"
import { errorHandler } from "../handlers/errorHandler";
import { checkHashExist } from "./loadToDb";


const sendFile = async(res:Response,url:string) => {
    try{
        const fileURL = await fetch(url).then((res1) => res1.arrayBuffer());
        const buffer = Buffer.from(fileURL);
        res.writeHead(200, {
            "Content-Length": buffer.length,
        });
        return res.end(buffer);
    }
    catch(error){
        return errorHandler(res,500,error?.message || "internal server error")
    }
}

/* getData: fetch data using hash 
@params: hash
@returns: data
*/
const getData = async (req: Request | any, res: Response): Promise<Response | void> => {
    try{
        const { hash } = req.params;
        if(!hash){
           errorHandler(res,400,"hash is required")
        }
        const ipfs = await fetchData(hash);

        if(!ipfs) {
            // Edge case load data if not found in db but exist in ipfs
            const check:any = await checkHashExist(hash);
            if(!check) return errorHandler(res,404,"hash not found")
            return typeof check?.data === "string" && check?.data?.startsWith("https://qbipfstest.s3.ap-southeast-1.amazonaws.com/") ?
            sendFile(res,check?.data) : res.status(200).send(check?.data)
        }
        if(typeof ipfs?.data === "string" && ipfs?.data?.startsWith("https://qbipfstest.s3.ap-southeast-1.amazonaws.com/")){
            return sendFile(res,ipfs?.data)
        } else {
            return res.status(200).send(ipfs?.data)
        }
    }
    catch(error){
        logger.error(error)
        errorHandler(res,500,error?.message || "internal server error")
    }
}



export {
    getData
}