
import { uploadBlob } from '../utils/s3Uploader';
import logger from '../utils/logger';
import { findHash,putData } from '../services';


/* 
upload: edge case if hash is not found in dB but exist in ipfs 
@params: data, hash
@returns:  status, message, and hash of the stored data
*/



const uploadToDB = async (hash:string,data: string | object | any) => {
    try {
        const hashCheck = await findHash(hash);
        if(hashCheck) return false;
        const uploadToDB = await putData(hash, data);
        return uploadToDB;
    }
    catch (error) {
      logger.error(error)
      return false;
       
    }
}


const mediaTypes = ["image", "video", "audio", "application/pdf"];
const checkHashExist = async(hash:string) => {
    try{
        // abort request if it takes more than 5 seconds
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const check = await fetch(`https://ipfs.questbook.app:8080/ipfs/${hash}`,{ signal: controller.signal });
        clearTimeout(timeoutId);
        // if hash not found in ipfs return false
        if(check?.status !== 200) {
            return false;
        }
        if(!check) return false;
        const contentType = await check?.headers.get("content-type");
        if(contentType?.startsWith("application/json")) {
            const json = await check?.json();
            const jsonData = await uploadToDB(hash, json);
            return jsonData;
        }  else if (mediaTypes.some((type) => contentType?.includes(type))) {
            const blob = await check.blob();
         const fileName = hash + "." + contentType?.split("/")[1];
            const file = new File([blob], fileName, {
                type: contentType!,
                lastModified: Date.now(),
         });
          const cid = await uploadBlob(file,fileName);
         if (!cid) return false;
         const cidData = await uploadToDB(hash, cid?.Location);
         return cidData;
    } else {
        const text = await check.text();
        const textData = await uploadToDB(hash, text);
        return textData;
    }
    }
    catch(error){
        logger.error(error)
        return false;
    }
}






export {
    checkHashExist,
    uploadToDB
}