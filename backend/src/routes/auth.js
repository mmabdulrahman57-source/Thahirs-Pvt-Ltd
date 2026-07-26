import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../jsonStore.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'thahirs_jwt_secret_change_in_production';

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  adminRole: user.adminRole,
  company: user.company,
  phone: user.phone,
  whatsapp: user.whatsapp,
  address: user.address,
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, company, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = User.create({ name, email, password: hashed, role: 'customer', company, phone });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  const user = User.findOne({ _id: req.user.id });
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(safeUser(user));
});

router.put('/profile', authMiddleware, async (req, res) => {
  const { name, company, phone, whatsapp, address, password } = req.body;
  const data = { name, company, phone, whatsapp, address };
  if (password) data.password = await bcrypt.hash(password, 10);
  const user = User.findByIdAndUpdate(req.user.id, data, { new: true });
  res.json(safeUser(user));
});

export default router;
