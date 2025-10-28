const dotenv = require('dotenv')
dotenv.config()

const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL
});

async function checkRedisConnection() {
  try {
    await redisClient.connect(); // Connect to Redis
    console.log("✅ Redis is connected!");
    
    // Optional: test a simple command
    const pong = await redisClient.ping();
    console.log("PING response:", pong); // Should print "PONG"

  } catch (err) {
    console.error("❌ Redis connection failed:", err.message);
  }
}

checkRedisConnection()

redisClient.on('error', (err) => console.log('Redis connection error:', err));

module.exports = redisClient
