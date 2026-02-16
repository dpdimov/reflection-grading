import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const KEY = 'reflection:records';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const records = (await redis.get(KEY)) || [];
    return res.status(200).json(records);
  }

  if (req.method === 'POST') {
    const record = req.body;
    const records = (await redis.get(KEY)) || [];
    records.push({ ...record, savedAt: new Date().toISOString() });
    await redis.set(KEY, records);
    return res.status(200).json(records);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
