import Redis, { RedisOptions } from 'ioredis';

const redisOptions: RedisOptions = {
  retryStrategy: (times: number) => {
    if (times > 10) {
      return -1;
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  enableReadyCheck: false,
  enableOfflineQueue: false,
  ...(process.env.REDIS_SSL === 'true' && { tls: {} })
};

export const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, redisOptions)
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      ...redisOptions
    });

redisClient.on('error', (err) => {
});

redisClient.on('connect', () => {
});

redisClient.on('reconnecting', () => {
});

export default redisClient;
