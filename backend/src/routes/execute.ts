import { Router } from 'express';
import { execute } from '../services/execute';

const router = Router();

router.post('/execute', execute);

export default router; 