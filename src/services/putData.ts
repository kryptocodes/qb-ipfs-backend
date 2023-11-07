import { Ipfs, IIpfs } from "../models/ipfs";

const putData = async (hash: string, data: string):Promise<IIpfs | null > => {
    const create:IIpfs  = await Ipfs.create({ hash, data });
    return create;
}

export {
    putData
}