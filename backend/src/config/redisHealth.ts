import Redis, { RedisOptions } from 'ioredis';

export async function checkRedisConnection(): Promise<void> {
  const testOptions: RedisOptions = {
    retryStrategy: () => null, 
    enableReadyCheck: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
    commandTimeout: 5000,
    ...(process.env.REDIS_SSL === 'true' && { tls: {} })
  };

  const testRedis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, testOptions)
    : new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        ...testOptions
      });

  testRedis.on('error', () => {
  });

  try {
    const response = await testRedis.ping();

    if (response === 'PONG') {
      await testRedis.quit();
      return;
    } else {
      throw new Error('Redis PING did not return PONG');
    }
  } catch (error) {
    await testRedis.quit().catch(() => {});
    throw error;
  }
}

export default checkRedisConnection;

