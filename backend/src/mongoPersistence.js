import AppSnapshot from './models/AppSnapshot.js';

const SNAPSHOT_KEY = 'main';

export async function loadSnapshot() {
  const doc = await AppSnapshot.findOne({ key: SNAPSHOT_KEY }).lean();
  return doc?.data || null;
}

export async function saveSnapshot(data) {
  await AppSnapshot.findOneAndUpdate(
    { key: SNAPSHOT_KEY },
    { key: SNAPSHOT_KEY, data },
    { upsert: true, new: true },
  );
}
