const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const { redisConnection, emailQueue } = require('../config/queue');
const { fetchCodeforcesData } = require('../services/codeforcesService');
const Student = require('../models/Student');
require('dotenv').config();

// Establish MongoDB connection for this worker process
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Sync worker connected to MongoDB successfully.'))
    .catch(err => {
        console.error('Sync worker MongoDB connection error:', err);
        process.exit(1);
    });

console.log('Sync worker process started.');

// Create a new worker that processes jobs from the 'sync-queue'.
// This worker is rate-limited to respect the Codeforces API.
const syncWorker = new Worker('sync-queue', async (job) => {
    const { studentId, handle } = job.data;
    console.log(`Processing sync job ${job.id} for handle: ${handle}`);

    try {
        // 1. Fetch fresh data from Codeforces
        const newData = await fetchCodeforcesData(handle);

        // 2. Update the student's record in the database
        await Student.updateOne({ _id: studentId }, { $set: newData });
        console.log(`Successfully synced data for handle: ${handle}`);

        // 3. Add a job to the email queue to check for inactivity
        const student = await Student.findById(studentId).lean(); // Get the full student doc
        if (student) {
            await emailQueue.add('check-inactivity', { 
                studentId: student._id.toString(),
                name: student.name,
                email: student.email,
                disable_email_reminders: student.disable_email_reminders,
                submission_history: student.submission_history,
            });
            console.log(`Added inactivity check job for ${student.name} to the email queue.`);
        }
    } catch (error) {
        console.error(`Failed to process sync job for handle ${handle}. Reason: ${error.message}`);
        // IMPORTANT: Re-throw the error to make the job fail in BullMQ
        // This will allow BullMQ's retry mechanism to kick in.
        throw error;
    }
}, { 
    connection: redisConnection,
    limiter: {
        max: 1, // Max 1 job
        duration: 1100 // per 1.1 seconds
    }
});

syncWorker.on('completed', (job) => {
  console.log(`Sync job ${job.id} for ${job.data.handle} has completed.`);
});

syncWorker.on('failed', (job, err) => {
  console.error(`Sync job ${job.id} for ${job.data.handle} failed with error: ${err.message}`);
}); 