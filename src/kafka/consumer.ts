import { Kafka } from 'kafkajs';
import Webhook, { IWebhook } from '../models/Webhook';
import EventLog, { IEventLog } from '../models/EventLog';
import { deliverWithRetry } from './retry';
import { WebhookEvent } from '../types';

const kafka = new Kafka({
  clientId: 'webhook-consumer',
  brokers: [process.env.KAFKA_BROKER!],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_USERNAME!,
    password: process.env.KAFKA_PASSWORD!,
  },
});

const consumer = kafka.consumer({ groupId: 'webhook-group' });

export default async function eventHandler(): Promise<void> {
  await consumer.connect();
  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC!, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const raw = message.value?.toString();
        if (!raw) return;

        const event: WebhookEvent = JSON.parse(raw);

        const subscribers: IWebhook[] = await Webhook.find({
          active: true,
          userId:event.userId,
          sourceUrl: event.sourceUrl
        });

        for (const hook of subscribers) {
          await deliverWithRetry(hook.callbackUrl, event, process.env.WEBHOOK_SECRET!);
        }

        console.log(`[Kafka] ${event.eventType} → ${subscribers.length} subscriber(s)`);
      } catch (err: unknown) {
        console.error('[Kafka Consumer Error]', (err as Error).message);
      }
    }
  });
}
