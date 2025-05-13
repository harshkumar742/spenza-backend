import mongoose, { Schema, Document } from 'mongoose';

export interface IEventLog extends Document {
    userId: string;
    sourceUrl: string;
    eventType: string;
    payload: Record<string, any>;
    callbackUrl: string;
    status: 'success' | 'failed';
    attempts: number;
    receivedAt: Date;
}

const EventLogSchema: Schema = new Schema({
    userId: { type: String, required: true },
    sourceUrl: { type: String, required: true },
    eventType: { type: String, required: true },
    payload: { type: Object, required: true },
    callbackUrl: { type: String, required: true },
    status: { type: String, enum: ['success', 'failed'], required: true },
    attempts: { type: Number, required: true },
    receivedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IEventLog>('EventLog', EventLogSchema);
