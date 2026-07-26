import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: String,
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  url: { type: String, required: true },
  category: { type: String, enum: ['office', 'warehouse', 'store', 'projects', 'products'], default: 'office' },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Gallery', gallerySchema);
