import express, { Request, Response } from 'express';
import axios from 'axios';
import { signPayload } from '../utils/signing';
import { authMiddleware } from '../middleware/auth';
import { WebhookEvent, SourceSystem } from '../types';

const router = express.Router();

router.post('/simulate', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).body.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: no userId found' });
    }

    const { sourceUrl, eventType, payload } = req.body;

    if (!sourceUrl || !eventType || !payload) {
        return res.status(400).json({ error: 'sourceUrl, eventType, and payload are required' });
    }

    const event: WebhookEvent = {
        userId,
        sourceUrl,
        eventType,
        payload
    };

    const signature = signPayload(event, process.env.WEBHOOK_SOURCE_SECRET!);

    try {
        const response = await axios.post('http://localhost:8000/api/webhook/incoming', event, {
            headers: {
                'X-Webhook-Signature': signature
            }
        });
        res.status(200).json({ status: 'Webhook simulated', forwarded: response.data });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
