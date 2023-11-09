import logger from '../utils/logger';
import { Request, Response, NextFunction } from 'express';
import formidable, { Fields, Files } from 'formidable';
import { errorHandler } from '../handlers/errorHandler';


/* 
parseForm: parse form data
@params: req, res, next
@returns:  req.body.data and req.body.file
*/
export const parseForm = (req: Request | any, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: false, uploadDir: './uploads' });
    try{
     form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
        if (err) {
            logger.error(err);
            errorHandler(res, 500, err?.message || 'internal server error');   
        }
        req.body = fields;
        req.files = files;
        next();
    });
} catch(error){
    logger.error(error);
    errorHandler(res, 500, error?.message || 'internal server error');
}
}