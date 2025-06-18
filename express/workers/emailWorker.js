const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const { redisConnection } = require('../config/queue');
const inactivityService = require('../services/inactivityService');
require('dotenv').config();

// Establish MongoDB connection for this worker process
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Email worker connected to MongoDB successfully.'))
    .catch(err => {
        console.error('Email worker MongoDB connection error:', err);
        process.exit(1); // Exit if cannot connect to DB
    });

console.log('Email worker process started.');

// Create a new worker that processes jobs from the 'email-queue'.
const worker = new Worker('email-queue', async (job) => {
  const { name, email, submission_history, disable_email_reminders, studentId } = job.data;
  
  console.log(`Processing job ${job.id} for student: ${name}`);

  // Re-construct a student-like object for the service
  const studentData = {
    _id: studentId,
    name,
    email,
    submission_history,
    disable_email_reminders
  };

  // Call the same inactivity logic service, but now it's done in this separate process.
  await inactivityService.checkAndNotify(studentData);

}, { connection: redisConnection });


worker.on('completed', (job) => {
  console.log(`Job ${job.id} for ${job.data.name} has completed.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} for ${job.data.name} failed with error: ${err.message}`);
}); 