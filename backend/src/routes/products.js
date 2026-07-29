import express from 'express';
import { Category, Brand, Product, populate } from '../jsonStore.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/categories', (req, res) => {
  res.json(Category.find().sort((a, b) => a.order - b.order));
});

router.get('/brands', (req, res) => {
  res.json(Brand.find().sort((a, b) => a.name.localeCompare(b.name)));
});

router.get('/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const products = populate(
    Product.find({ $or: [{ name: { $regex: q, $options: 'i' } }, { tags: { $regex: q, $options: 'i' } }] }).slice(0, 8),
    ['category', 'brand']
  );
  res.json(products);
});

router.get('/', (req, res) => {
  const { category, brand, search, featured, limit = 50, page = 1 } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (featured) filter.featured = true;
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
    { tags: { $regex: search, $options: 'i' } },
  ];
  const all = populate(Product.find(filter), ['category', 'brand']);
  const total = all.length;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const products = all.slice(skip, skip + parseInt(limit));
  res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

router.get('/:slug', (req, res) => {
  const product = populate([Product.findOne({ slug: req.params.slug })], ['category', 'brand'])[0];
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const related = populate(
    Product.find({ category: product.category?._id || product.category, _id: { $ne: product._id } }).slice(0, 4),
    ['category', 'brand']
  );
  res.json({ product, related });
});

router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    res.status(201).json(await Product.create(req.body));
  } catch (err) {
    console.error('[products] create failed:', err.message);
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    res.json(await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
