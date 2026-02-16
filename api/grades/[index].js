import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});
const KEY = 'reflection:records';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const index = parseInt(req.query.index, 10);
  const records = (await redis.get(KEY)) || [];

  if (isNaN(index) || index < 0 || index >= records.length) {
    return res.status(400).json({ error: 'Invalid index' });
  }

  records.splice(index, 1);
  await redis.set(KEY, records);
  return res.status(200).json(records);
}
