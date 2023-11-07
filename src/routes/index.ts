import { uploadFile,upload } from '../controllers/storeData';
import { getData } from '../controllers/getData';

import { Router } from 'express';
import { parseForm } from '../middleware/formdiable'

const router = Router();

router.get('/:hash', getData);
router.post('/upload', upload);
router.post('/upload/file', parseForm, uploadFile);


export default router;
