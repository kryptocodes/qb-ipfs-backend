import { storeData } from '../controllers/storeData';
import { getData } from '../controllers/getData';

import { Router } from 'express';
import { parseForm } from '../middleware/formdiable'

const router = Router();

router.get('/:hash', getData);
router.post('/upload',parseForm, storeData);


export default router;
