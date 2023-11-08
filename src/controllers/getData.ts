import { Request, Response } from "express";
import logger from "../utils/logger";
import { fetchData } from "../services"


/* getData: fetch data using hash 
@params: hash
@returns: data
*/
const getData = async (req: Request | any, res: Response): Promise<Response | void> => {
    try{
        const { hash } = req.params;
        if(!hash){
            return res.status(400).json({
                status: "400",
                message: "hash is required"
            })
        }
        const ipfs = await fetchData(hash);
        if(!ipfs) return res.status(400).json({ status: "400", message: "hash not found" })
        if(typeof ipfs?.data === "string" && ipfs?.data?.startsWith("https://")){
            return res.redirect(ipfs?.data)
        } else {
            return res.status(200).send(ipfs?.data)
        }
    }
    catch(error){
        logger.error(error)
        return res.status(500).json({
            status: "500",
            message: error?.message || "internal server error"
        })
    }
}

export {
    getData
}