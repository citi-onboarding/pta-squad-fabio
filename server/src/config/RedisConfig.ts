import IORedis, { RedisOptions } from "ioredis";

export const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || "redis",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
};

export const createRedisConnection = () => {
  const connection = new IORedis(redisConfig);

  connection.on("connect", () => console.log("Redis connected"));
  connection.on("error", (err) => console.error("Redis error:", err));
  connection.on("reconnecting", () => console.log("Redis reconnecting..."));

  return connection;
};