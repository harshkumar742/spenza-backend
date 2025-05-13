import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth';
import webhookRoutes from './routes/webhook';
import simulateRoute from './routes/simulate';
import eventHandler from './kafka/consumer';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api', simulateRoute);


mongoose.connect(process.env.MONGO_URI!).then(() => {
  console.log('MongoDB connected');
  eventHandler();
  app.listen(Number(process.env.PORT) || 8000, () => console.log('Server running'));
});
