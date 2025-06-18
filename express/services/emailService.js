const nodemailer = require('nodemailer');

let transporter;

// Use an environment variable for the base URL of the frontend, with a fallback for development
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const LOGO_URL = `${FRONTEND_URL}/logo.png`;

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
              <body style="background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center">
                      <table width="600" border="0" cellspacing="0" cellpadding="40" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                          <td align="center" style="border-bottom: 1px solid #e5e7eb;">
                            <img src="${LOGO_URL}" alt="TLE Eliminators Logo" style="height: 40px; width: 40px;"/>
                            <h1 style="font-size: 24px; font-weight: 600; color: #111827; margin-top: 10px;">TLE Eliminators</h1>
                          </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                          <td>
                            <h2 style="font-size: 20px; font-weight: 600; color: #1f2937;">Hi ${studentName},</h2>
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                              We noticed you haven't made any submissions on Codeforces in the last 7 days.
                            </p>
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                              Consistent practice is the key to success in competitive programming. Keep your skills sharp and continue your journey!
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                              <a href="${FRONTEND_URL}" style="background-color: #0284c7; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                                Solve a Problem
                              </a>
                            </div>
                          </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                          <td align="center" style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                            <p style="color: #6b7280; font-size: 12px;">
                              &copy; ${new Date().getFullYear()} TLE Eliminators. All rights reserved.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
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