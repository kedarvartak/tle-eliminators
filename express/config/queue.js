const { Queue } = require('bullmq');
require('dotenv').config();

// This connection object will be used by both the queue and the workers.
const redisConnection = {
  host: new URL(process.env.REDIS_URL).hostname,
  port: new URL(process.env.REDIS_URL).port,
  username: new URL(process.env.REDIS_URL).username,
  password: new URL(process.env.REDIS_URL).password,
};

// Create a new queue named 'email-queue' and export it.
const emailQueue = new Queue('email-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Retry a job up to 3 times if it fails
    backoff: {
      type: 'exponential',
      delay: 5000, // Wait 5 seconds before the first retry
    },
  },
});

module.exports = {
  emailQueue,
  redisConnection,
}; 