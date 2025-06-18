const cron = require('node-cron');
const Student = require('../models/Student');
const { fetchCodeforcesData } = require('../services/codeforcesService');
const { emailQueue } = require('../config/queue');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Syncs Codeforces data for all students in the database.
 * Logs progress and errors.
 */
const syncAllStudents = async () => {
    console.log('Starting daily student sync job...');
    const startTime = Date.now();

    try {
        const students = await Student.find({}).lean(); // Use lean for performance
        console.log(`Found ${students.length} students to sync.`);

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            console.log(`[${i + 1}/${students.length}] Syncing data for ${student.name} (${student.codeforces_handle})...`);

            try {
                const newData = await fetchCodeforcesData(student.codeforces_handle);
                await Student.updateOne({ _id: student._id }, { $set: newData });
                console.log(`Successfully synced data for ${student.name}.`);

                // Now, add a job to the queue instead of calling the service directly
                // We pass only the necessary data to the job
                await emailQueue.add('check-inactivity', { 
                    studentId: student._id.toString(),
                    name: student.name,
                    email: student.email,
                    disable_email_reminders: student.disable_email_reminders,
                    submission_history: newData.submission_history, // Pass the fresh submission history
                });
                console.log(`Added inactivity check job for ${student.name} to the queue.`);

            } catch (error) {
                console.error(`Failed to sync or queue job for ${student.name}. Reason: ${error.message}`);
            }

            // Add a delay to avoid hitting API rate limits
            if (i < students.length - 1) {
                await delay(500); // 0.5 second delay between API calls
            }
        }
    } catch (error) {
        console.error('A critical error occurred during the student sync job:', error);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`Finished daily student sync job in ${duration} seconds.`);
};

/**
 * Initializes and schedules all cron jobs for the application.
 */
const scheduleJobs = () => {
    // Schedule the sync job to run daily at 2:00 AM.
    // The schedule can be configured via environment variables.
    const schedule = process.env.CRON_SCHEDULE || '0 2 * * *';

    cron.schedule(schedule, syncAllStudents, {
        scheduled: true,
        timezone: "Asia/Kolkata" 
    });

    console.log(`Student sync job scheduled with pattern: "${schedule}"`);
};

module.exports = { scheduleJobs, syncAllStudents }; 