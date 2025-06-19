const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const { redisConnection, emailQueue } = require('../config/queue');
const { fetchCodeforcesData } = require('../services/codeforcesService');
const Student = require('../models/Student');
require('dotenv').config();


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Sync worker connected to MongoDB successfully.'))
    .catch(err => {
        console.error('Sync worker MongoDB connection error:', err);
        process.exit(1);
    });

console.log('Sync worker process started.');


const syncWorker = new Worker('sync-queue', async (job) => {
    const { studentId, handle } = job.data;
    console.log(`Processing sync job ${job.id} for handle: ${handle}`);

    try {
        
        const newData = await fetchCodeforcesData(handle);

        
        await Student.updateOne({ _id: studentId }, { $set: newData });
        console.log(`Successfully synced data for handle: ${handle}`);

    
        const student = await Student.findById(studentId).lean(); 
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
        
        throw error;
    }
}, { 
    connection: redisConnection,
    limiter: {
        max: 1, 
        duration: 1100 
    }
});

syncWorker.on('completed', (job) => {
  console.log(`Sync job ${job.id} for ${job.data.handle} has completed.`);
});

syncWorker.on('failed', (job, err) => {
  console.error(`Sync job ${job.id} for ${job.data.handle} failed with error: ${err.message}`);
}); 