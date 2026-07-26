import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: String,
  role: String,
  content: { type: String, required: true },
  rating: { type: Number, default: 5 },
  featured: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Testimonial', testimonialSchema);
