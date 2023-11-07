import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from 'uuid';

interface IIpfs {
    hash: string;
    data: object | string | null;
}

const ipfsSchema = new Schema<IIpfs>
({
    hash: {
        type: String,
        default: () => uuidv4(),
        index: true,
    },
    data: {
        type: Schema.Types.Mixed,
        required: false,
        default: null,
    },
}, {
    timestamps: true,
});

const Ipfs = model<IIpfs>("ipfs", ipfsSchema);
export {
    Ipfs,
    IIpfs
}