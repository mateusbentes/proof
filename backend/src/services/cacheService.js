const redis = require('redis');

let client;
const CACHE_TTL = 3600; // 1 hour default

const initializeCache = async () => {
  if (!process.env.REDIS_URL) {
    console.warn('Redis not configured. Caching disabled.');
    return;
  }

  try {
    client = redis.createClient({
      url: process.env.REDIS_URL,
    });

    client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    await client.connect();
    console.log('✓ Redis cache connected');
  } catch (error) {
    console.warn('Failed to connect to Redis:', error.message);
  }
};

const get = async (key) => {
  if (!client) return null;

  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

const set = async (key, value, ttl = CACHE_TTL) => {
  if (!client) return;

  try {
    await client.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

const del = async (key) => {
  if (!client) return;

  try {
    await client.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
};

const invalidatePattern = async (pattern) => {
  if (!client) return;

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.error('Cache invalidate error:', error);
  }
};

const clear = async () => {
  if (!client) return;

  try {
    await client.flushDb();
  } catch (error) {
    console.error('Cache clear error:', error);
  }
};

module.exports = {
  initializeCache,
  get,
  set,
  del,
  invalidatePattern,
  clear,
};
