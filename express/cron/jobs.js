const cron = require('node-cron');
const Student = require('../models/Student');
const { syncQueue } = require('../config/queue');

/**
 * Schedules the daily job to add all students to the sync queue.
 * This job is now just a "scheduler" or "producer".
 */
const scheduleSyncAllStudents = async () => {
    console.log('Starting daily scheduling job...');
    const startTime = Date.now();

    try {
        const students = await Student.find({}, '_id codeforces_handle').lean();
        console.log(`Found ${students.length} students to schedule for sync.`);

        for (const student of students) {
            // Add a job for each student to the sync-queue.
            // The job name 'sync-student' describes the task.
            // We pass the student's ID and handle as payload.
            await syncQueue.add('sync-student', { 
                studentId: student._id.toString(),
                handle: student.codeforces_handle
            });
        }
        
        console.log(`Successfully scheduled sync jobs for ${students.length} students.`);

    } catch (error) {
        console.error('A critical error occurred during the student scheduling job:', error);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`Finished daily scheduling job in ${duration} seconds.`);
};

/**
 * Initializes and schedules all cron jobs for the application.
 */
const scheduleJobs = () => {
    // Schedule the sync job to run daily at 2:00 AM.
    const schedule = process.env.CRON_SCHEDULE || '0 2 * * *';

    cron.schedule(schedule, scheduleSyncAllStudents, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    console.log(`Student sync scheduling job registered with pattern: "${schedule}"`);
};

module.exports = { scheduleJobs, scheduleSyncAllStudents }; 