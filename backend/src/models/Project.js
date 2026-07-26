import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  industry: String,
  location: String,
  images: [String],
  completedAt: Date,
  featured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
