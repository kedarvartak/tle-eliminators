const { Queue } = require('bullmq');
require('dotenv').config();

// This connection object will be used by all queues and workers.
const redisConnection = {
  host: new URL(process.env.REDIS_URL).hostname,
  port: new URL(process.env.REDIS_URL).port,
  username: new URL(process.env.REDIS_URL).username,
  password: new URL(process.env.REDIS_URL).password,
};

// Queue for sending email notifications
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

// NEW: Queue for syncing student data from Codeforces API
const syncQueue = new Queue('sync-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 10000, // Wait 10 seconds before retrying a failed sync
    },
  },
});

module.exports = {
  emailQueue,
  syncQueue,
  redisConnection,
}; 