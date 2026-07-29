import express from 'express';
import { Message } from '../jsonStore.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const message = await Message.create(req.body);
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'info@thahirsgroup.com',
        subject: `Contact: ${req.body.subject || 'New Message'}`,
        html: `<p>From: ${req.body.name} (${req.body.email})</p><p>${req.body.message}</p>`,
      });
    } catch (emailErr) {
      console.warn('[messages] Email notification failed:', emailErr.message);
    }
    res.status(201).json(message);
  } catch (err) {
    console.error('[messages] create failed:', err.message);
    res.status(400).json({ message: err.message || 'Failed to save message' });
  }
});

router.get('/', authMiddleware, adminOnly, (req, res) => {
  res.json(Message.find().reverse());
});

router.put('/:id/read', authMiddleware, adminOnly, async (req, res) => {
  try {
    res.json(await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
