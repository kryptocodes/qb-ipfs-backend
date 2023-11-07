import { IIpfs, Ipfs } from "../models/ipfs";

/* 
findHash: find hash in mongodb
@params: hash
@returns: hash or null
*/
const findHash = async (hash: string): Promise<String | Boolean> => {
    const ipfs = await Ipfs.findOne({ hash }).lean() 
    return ipfs?.hash || false;
}

const fetchData = async (hash: string): Promise<IIpfs | null> => {
    const ipfs = await Ipfs.findOne({ hash });

    if (!ipfs) {
        return null; // Document not found, return null
    }

    return ipfs;
}


export {
    findHash,
    fetchData
}