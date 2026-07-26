import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  images: [String],
  specifications: [{ key: String, value: String }],
  datasheet: String,
  featured: { type: Boolean, default: false },
  tags: [String],
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
