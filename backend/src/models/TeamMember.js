import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  experience: String,
  email: String,
  linkedin: String,
  photo: String,
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('TeamMember', teamMemberSchema);
