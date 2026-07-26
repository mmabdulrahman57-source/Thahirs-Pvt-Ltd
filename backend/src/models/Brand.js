import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: String,
  logo: String,
  description: String,
  website: String,
  featured: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Brand', brandSchema);
