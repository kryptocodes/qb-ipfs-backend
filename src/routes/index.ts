import { uploadFile,upload } from '../controllers/storeData';
import { getData } from '../controllers/getData';

// import { uploadToDB,uploadFiletoDB} from '../controllers/loadToDb'
import { Router } from 'express';
import { parseForm } from '../middleware/formdiable'

const router = Router();

router.get('/:hash', getData);
router.post('/upload',parseForm,upload);
router.post('/upload/file', parseForm, uploadFile);

// router.post('/upload/db', uploadToDB);
// router.post('/upload/file/db', parseForm, uploadFiletoDB);


export default router;
