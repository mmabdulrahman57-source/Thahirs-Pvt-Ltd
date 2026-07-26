import mongoose from 'mongoose';

const quotationItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: String,
  description: String,
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: 'pcs' },
  preferredBrand: String,
  requiredDate: Date,
  deliveryLocation: String,
  specialNotes: String,
  unitPrice: Number,
  totalPrice: Number,
});

const quotationSchema = new mongoose.Schema({
  reference: { type: String, unique: true },
  customer: {
    name: { type: String, required: true },
    company: String,
    email: { type: String, required: true },
    phone: String,
    whatsapp: String,
    address: String,
  },
  items: [quotationItemSchema],
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'quoted', 'accepted', 'rejected'],
    default: 'pending',
  },
  adminNotes: String,
  totalAmount: Number,
  validUntil: Date,
  quotedAt: Date,
  quotedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Quotation', quotationSchema);
