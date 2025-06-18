const { Queue } = require('bullmq');
require('dotenv').config();

const redisConnection = {
  host: new URL(process.env.REDIS_URL).hostname,
  port: new URL(process.env.REDIS_URL).port,
  username: new URL(process.env.REDIS_URL).username,
  password: new URL(process.env.REDIS_URL).password,
};


const emailQueue = new Queue('email-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, 
    },
  },
});

const syncQueue = new Queue('sync-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 10000, 
    },
  },
});

module.exports = {
  emailQueue,
  syncQueue,
  redisConnection,
}; 