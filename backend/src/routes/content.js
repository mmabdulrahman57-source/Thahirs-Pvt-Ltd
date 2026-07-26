import express from 'express';
import { TeamMember, Gallery, Project, Testimonial, Brand, Category, Quotation, Message, Product } from '../jsonStore.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/team', (req, res) => {
  res.json(TeamMember.find().sort((a, b) => a.order - b.order));
});

router.get('/gallery', (req, res) => {
  const { category } = req.query;
  const items = Gallery.find(category ? { category } : {});
  res.json(items.reverse());
});

router.get('/projects', (req, res) => {
  res.json(Project.find().reverse());
});

router.get('/testimonials', (req, res) => {
  res.json(Testimonial.find({ featured: true }));
});

router.get('/stats', (req, res) => {
  res.json({
    products: Product.countDocuments(),
    brands: Brand.countDocuments(),
    categories: Category.countDocuments(),
    quotations: Quotation.countDocuments(),
    messages: Message.countDocuments({ read: false }),
    pendingQuotations: Quotation.countDocuments({ status: 'pending' }),
  });
});

router.get('/dashboard', authMiddleware, adminOnly, (req, res) => {
  res.json({
    stats: {
      products: Product.countDocuments(),
      brands: Brand.countDocuments(),
      quotations: Quotation.countDocuments(),
      pendingQuotations: Quotation.countDocuments({ status: 'pending' }),
      unreadMessages: Message.countDocuments({ read: false }),
    },
    recentQuotations: Quotation.find().reverse().slice(0, 5),
    recentMessages: Message.find().reverse().slice(0, 5),
  });
});

export default router;
