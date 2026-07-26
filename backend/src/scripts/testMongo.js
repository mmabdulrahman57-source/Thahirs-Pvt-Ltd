import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const hosts = [
  'ac-zojzjgz-shard-00-00.71xb7vi.mongodb.net',
  'ac-zojzjgz-shard-00-01.71xb7vi.mongodb.net',
  'ac-zojzjgz-shard-00-02.71xb7vi.mongodb.net',
];

const user = 'mmabdulrahman57_db_user';
const pass = 'cuLIJmY10ixffpVg';

for (const host of hosts) {
  const uri = `mongodb://${user}:${pass}@${host}:27017/thahirs?authSource=admin&ssl=true&directConnection=true&serverSelectionTimeoutMS=15000`;
  try {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    console.log(`Trying ${host}...`);
    await mongoose.connect(uri);
    const ping = await mongoose.connection.db.admin().command({ ping: 1 });
    console.log(`SUCCESS on ${host}`, ping);
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.log(`  ${e.message.split('\n')[0]}`);
  }
}

process.exit(1);
