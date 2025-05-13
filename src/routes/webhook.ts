import express, { Request, Response } from 'express';
import Webhook from '../models/Webhook';
import { authMiddleware } from '../middleware/auth';
import { sendToKafka } from '../kafka/producer';
import { verifySignature } from '../utils/signing';
import { WebhookEvent, SourceSystem } from '../types';
import EventLog from '../models/EventLog';

const router = express.Router();

router.post('/subscribe', authMiddleware, async (req: Request, res: Response) => {
  const { sourceUrl, callbackUrl } = req.body;

  if (!Object.values(SourceSystem).includes(sourceUrl) || !callbackUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid sourceUrl or callbackUrl' });
  }

  const webhook = new Webhook({ userId: req.body.userId, sourceUrl, callbackUrl, active: true });
  await webhook.save();
  res.status(201).json(webhook);
});

router.post('/cancel', authMiddleware, async (req: Request, res: Response) => {
  const { webhookId } = req.body;
  await Webhook.findOneAndUpdate({ _id: webhookId, userId: req.body.userId }, { active: false });
  res.json({ success: true });
});

router.get('/list', authMiddleware, async (req: Request, res: Response) => {
  const hooks = await Webhook.find({ userId: req.body.userId, active: true});
  res.json(hooks);
});

router.post('/incoming', async (req: Request<{}, {}, WebhookEvent>, res: Response) => {
  const signature = req.headers['x-webhook-signature'];
  const event = req.body;

  if (!event.sourceUrl || !event.eventType || !event.payload || typeof signature !== 'string') {
    return res.status(400).json({ error: 'Invalid format or missing signature' });
  }

  const isValid = verifySignature(event, signature, process.env.WEBHOOK_SOURCE_SECRET!);
  if (!isValid) {
    return res.status(403).json({ error: 'Invalid signature' });
  }

  await sendToKafka(process.env.KAFKA_TOPIC!, event);
  res.status(200).json({ status: 'Accepted' });
});

router.get('/sent', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).body.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: missing user' });
    }

    const events = await EventLog.find({ userId })
      .sort({ receivedAt: -1 })
      .limit(20);

    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch sent events' });
  }
});

export default router;
