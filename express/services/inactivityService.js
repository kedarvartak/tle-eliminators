const Student = require('../models/Student');
const { sendInactivityReminder } = require('./emailService');

const INACTIVITY_THRESHOLD_DAYS = 7;

/**
 * Checks a student's submission history and sends an inactivity reminder if needed.
 * @param {object} student - A full student document from the database.
 */
const checkAndNotify = async (student) => {
  // 1. Check if the student has disabled reminders
  if (student.disable_email_reminders) {
    console.log(`Skipping inactivity check for ${student.name} (reminders disabled).`);
    return;
  }

  // 2. Find the most recent submission
  if (!student.submission_history || student.submission_history.length === 0) {
    console.log(`No submissions found for ${student.name}. Cannot determine inactivity.`);
    return; // No submissions, so can't be inactive based on submission date.
  }

  // Submissions are sorted newest first by the Codeforces API.
  const lastSubmission = student.submission_history[0];
  const lastSubmissionDate = new Date(lastSubmission.creationTimeSeconds * 1000);

  // 3. Check if the last submission is outside the inactivity threshold
  const today = new Date();
  const thresholdDate = new Date(today);
  thresholdDate.setDate(today.getDate() - INACTIVITY_THRESHOLD_DAYS);

  if (lastSubmissionDate < thresholdDate) {
    console.log(`${student.name} is inactive. Last submission was on ${lastSubmissionDate.toLocaleDateString()}. Sending reminder.`);
    
    // 4. Send the email and update the database
    try {
      await sendInactivityReminder(student.name, student.email);
      
      // Atomically increment the reminder count in the database
      await Student.updateOne(
        { _id: student._id },
        { $inc: { reminder_sent_count: 1 } }
      );

      console.log(`Successfully updated reminder count for ${student.name}.`);
    } catch (error) {
      console.error(`An error occurred during the notification process for ${student.name}:`, error);
    }
  } else {
    console.log(`Student ${student.name} is active. Last submission on ${lastSubmissionDate.toLocaleDateString()}. No reminder needed.`);
  }
};

module.exports = {
  checkAndNotify,
}; 