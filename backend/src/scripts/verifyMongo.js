import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const uri = process.env.MONGODB_URI_STANDARD || process.env.MONGODB_URI;
await mongoose.connect(uri, { serverSelectionTimeoutMS: 25000 });

const cols = await mongoose.connection.db.listCollections().toArray();
console.log('=== MongoDB Atlas — thahirs database ===\n');
for (const { name } of cols.sort((a, b) => a.name.localeCompare(b.name))) {
  const count = await mongoose.connection.db.collection(name).countDocuments();
  console.log(`  ${name}: ${count} documents`);
}

await mongoose.disconnect();
