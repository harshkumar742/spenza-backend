import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhook extends Document {
  userId: string;
  sourceUrl: string;
  callbackUrl: string;
  active: boolean;
}

const WebhookSchema: Schema = new Schema({
  userId: { type: String, required: true },
  sourceUrl: { type: String, required: true },
  callbackUrl: { type: String, required: true },
  active: { type: Boolean, default: true }
});

export default mongoose.model<IWebhook>('Webhook', WebhookSchema);
