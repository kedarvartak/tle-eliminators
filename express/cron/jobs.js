const cron = require('node-cron');
const Student = require('../models/Student');
const CronJob = require('../models/CronJob');
const { syncQueue } = require('../config/queue');

let scheduledTasks = [];

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

const stopScheduledJobs = () => {
    scheduledTasks.forEach(task => task.stop());
    scheduledTasks = [];
    console.log('All scheduled cron jobs have been stopped.');
};

/**
 * Initializes and schedules all cron jobs for the application.
 */
const scheduleJobs = async () => {
    stopScheduledJobs();
    console.log('Initializing cron jobs...');

    try {
        let schedules = await CronJob.find({ isEnabled: true });

        if (schedules.length === 0) {
            console.log('No schedules found in DB. Creating a default schedule.');
            const defaultSchedule = new CronJob({
                name: 'Default Daily Sync at 2 AM',
                schedule: process.env.CRON_SCHEDULE || '0 2 * * *',
            });
            await defaultSchedule.save();
            schedules.push(defaultSchedule);
        }

        schedules.forEach(({ schedule, name, timezone }) => {
            if (cron.validate(schedule)) {
                const task = cron.schedule(schedule, scheduleSyncAllStudents, {
                    scheduled: true,
                    timezone: timezone || 'Asia/Kolkata',
                });
                scheduledTasks.push(task);
                console.log(`"${name}" job scheduled with pattern: "${schedule}"`);
            } else {
                console.error(`Invalid cron schedule pattern for "${name}": ${schedule}`);
            }
        });

    } catch (error) {
        console.error('Failed to schedule jobs:', error);
    }
};

const restartCronJobs = async () => {
    console.log('Restarting cron jobs due to schedule changes...');
    await scheduleJobs();
};

module.exports = { 
    scheduleJobs, 
    scheduleSyncAllStudents,
    restartCronJobs 
}; 