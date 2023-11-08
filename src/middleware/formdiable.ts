import { Request, Response, NextFunction } from 'express';
import formidable, { Fields, Files } from 'formidable';


/* 
parseForm: parse form data
@params: req, res, next
@returns:  req.body.data and req.body.file
*/
export const parseForm = (req: Request | any, res: Response, next: NextFunction) => {
    const form = formidable({ multiples: false });
    try{
     form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
        if (err) {
        return res.status(500).json({
            message: 'Error',
            error: err,
        });
        }
        req.body = fields;
        req.file = files;
        next();
    });
} catch(error){
    return res.status(500).json({
        message: 'Error',
        error: error,
    });
}
}