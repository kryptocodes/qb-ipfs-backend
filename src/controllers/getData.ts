import { Request, Response } from "express";
import logger from "../utils/logger";
import { fetchData } from "../services"
import { errorHandler } from "../handlers/errorHandler";


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
        if(!ipfs) errorHandler(res,400,"data not found")
        if(typeof ipfs?.data === "string" && ipfs?.data?.startsWith("https://")){
            return res.redirect(ipfs?.data)
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