import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();
  res.status(201).json({ success: true });
});

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user: IUser | null = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
  res.json({ token });
});

export default router;
