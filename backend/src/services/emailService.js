import nodemailer from 'nodemailer';

/**
 * Service to handle sending emails
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    // For development, use Ethereal (fake SMTP service)
    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.log('--- Email Service (Development) ---');
        console.log(`Test User : ${testAccount.user}`);
        console.log(`Test Pass : ${testAccount.pass}`);
        console.log('-----------------------------------');
      } catch (error) {
        console.error('Failed to create Ethereal test account:', error);
      }
    } else {
      // Production or manual SMTP config
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    this.initialized = true;
  }

  /**
   * Send a password reset email
   * @param {string} to - Recipient email
   * @param {string} resetToken - Unique reset token
   */
  async sendPasswordResetEmail(to, resetToken) {
    await this.init();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"SnapBudget" <${process.env.SMTP_USER || 'noreply@snapbudget.com'}>`,
      to,
      subject: 'Reset Your Password - SnapBudget',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #6366f1;">SnapBudget</h2>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>If you did not request this, please ignore this email.</p>
          <p style="font-size: 0.8em; color: #666; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
            This link will expire in 1 hour.<br>
            SnapBudget - Smart Financial Tracking.
          </p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Reset Email sent to ${to}`);
      if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return info;
    } catch (error) {
      console.error('Error sending reset email:', error);
      throw new Error('Could not send reset email');
    }
  }
}

export default new EmailService();
