import formidable from 'formidable';

// resuable wrapper for formidable

export const parseForm = (req: any, res: any, next: any) => {
    const form = formidable({ multiples: false });
    try{
    form.parse(req, (err: any, fields: any, files: any) => {
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