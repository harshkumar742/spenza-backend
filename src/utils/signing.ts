import crypto from 'crypto';
import { WebhookEvent } from '../types';

export function signPayload(payload: WebhookEvent, secret: string): string {
    return crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
}

export function verifySignature(payload: WebhookEvent, signature: string, secret: string): boolean {
    const expected = signPayload(payload, secret);
    return expected === signature;
}
