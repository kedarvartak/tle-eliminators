const nodemailer = require('nodemailer');

let transporter;

/**
 * Sets up and returns a Nodemailer transporter.
 * For development, it uses Ethereal to create a test inbox.
 * For production, this should be configured with a real email service provider.
 */
const setupTransporter = async () => {
    if (transporter) {
        return transporter;
    }

    // In a real production environment, you would use process.env variables
    // to configure a service like AWS SES, SendGrid, or Mailgun.
    // For now, we will use Ethereal for development, which requires no setup.
    if (process.env.NODE_ENV === 'production') {
       console.error("CRITICAL: Email service is not configured for production. Emails will not be sent.");
       // Return a mock transporter that does nothing in production if not configured.
       return { sendMail: () => Promise.resolve() };
    }

    // Use Ethereal.email for development
    try {
        let testAccount = await nodemailer.createTestAccount();
        console.log('Ethereal test account created. View sent emails at the "Preview URL" logged after sending.');
        
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // Generated ethereal user
                pass: testAccount.pass, // Generated ethereal password
            },
        });
    } catch (error) {
        console.error("Could not create Ethereal test account. Please check your internet connection.", error);
        // Return a mock transporter to prevent crashes
        return { sendMail: () => Promise.resolve() };
    }
    
    return transporter;
};

/**
 * Sends a pre-defined inactivity reminder email to a student.
 * @param {string} studentName The name of the student.
 * @param {string} studentEmail The email address of the student.
 */
const sendInactivityReminder = async (studentName, studentEmail) => {
    try {
        const mailTransporter = await setupTransporter();

        const mailOptions = {
            from: '"TLE Eliminators" <noreply@tle-eliminators.com>',
            to: studentEmail,
            subject: 'Friendly Reminder: Let\'s Get Back to Solving!',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
                    <h2 style="color: #0d6efd;">Hi ${studentName},</h2>
                    <p>We noticed you haven't made any submissions on Codeforces in the last 7 days.</p>
                    <p>Consistent practice is the key to success in competitive programming. Why not take a few minutes to solve a problem today and keep your skills sharp?</p>
                    <p>Happy coding!</p>
                    <br>
                    <p>Best regards,</p>
                    <p><strong>The TLE Eliminators Team</strong></p>
                </div>
            `,
        };

        const info = await mailTransporter.sendMail(mailOptions);

        console.log(`Inactivity reminder sent to ${studentEmail}. Message ID: ${info.messageId}`);
        // Log the Ethereal URL for easy testing
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);

    } catch (error) {
        console.error(`Error sending email to ${studentEmail}:`, error);
        // We don't re-throw the error because a failed email should not crash the entire sync process.
    }
};

module.exports = {
    sendInactivityReminder,
}; 