import express from 'express';
import { Message } from '../jsonStore.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const message = Message.create(req.body);
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'info@thahirsgroup.com',
      subject: `Contact: ${req.body.subject || 'New Message'}`,
      html: `<p>From: ${req.body.name} (${req.body.email})</p><p>${req.body.message}</p>`,
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/', authMiddleware, adminOnly, (req, res) => {
  res.json(Message.find().reverse());
});

router.put('/:id/read', authMiddleware, adminOnly, (req, res) => {
  res.json(Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true }));
});

router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  Message.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;
