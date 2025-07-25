import { Router, Request, Response } from 'express';
import { handlePrompt } from '../agent/agent';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { prompt, sessionId } = req.body;
  try {
    const result = await handlePrompt(prompt, sessionId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

export default router; 