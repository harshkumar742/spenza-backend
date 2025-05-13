import axios from 'axios';
import { WebhookEvent } from '../types';
import { signPayload } from '../utils/signing';
import EventLog from '../models/EventLog';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export async function deliverWithRetry(
    callbackUrl: string,
    payload: WebhookEvent,
    secret: string
): Promise<void> {
    let status: 'success' | 'failed' = 'failed';
    let attempt = 0;

    for (attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const signature = signPayload(payload, secret);

            await axios.post(callbackUrl, payload, {
                headers: {
                    'X-Spenza-Signature': signature
                },
                timeout: 5000
            });

            console.log(`Delivered to ${callbackUrl} (attempt ${attempt})`);
            status = 'success';
            break;
        } catch (err: any) {
            console.error(`Failed attempt ${attempt} → ${callbackUrl}:`, err.message);
            if (attempt < MAX_RETRIES) {
                await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
            }
        }
    }

    // Save EventLog entry
    await EventLog.create({
        userId: payload.userId,
        sourceUrl: payload.sourceUrl,
        eventType: payload.eventType,
        payload: payload.payload,
        callbackUrl,
        status,
        attempts: Math.min(attempt, MAX_RETRIES)
    });

    if (status === 'failed') {
        console.error(`Giving up after ${MAX_RETRIES} failed attempts: ${callbackUrl}`);
    }
}
