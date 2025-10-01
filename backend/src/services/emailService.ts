import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'College Code Hub'}" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendApprovalEmail(userEmail: string, userName: string, status: 'approved' | 'rejected'): Promise<boolean> {
    const isApproved = status === 'approved';
    const subject = isApproved 
      ? '🎉 Your Account Has Been Approved!' 
      : 'Account Registration Update';

    const html = isApproved 
      ? this.getApprovalEmailTemplate(userName)
      : this.getRejectionEmailTemplate(userName);

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  private getApprovalEmailTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to College Code Hub!</h1>
            <p>Your account has been approved</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Great news! Your account registration has been reviewed and <strong>approved</strong> by our admin team.</p>
            
            <p>You can now:</p>
            <ul>
              <li>✅ Access all platform features</li>
              <li>✅ Solve coding problems</li>
              <li>✅ Participate in competitions</li>
              <li>✅ Connect with other students</li>
              <li>✅ Build your coding profile</li>
            </ul>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/auth/login" class="button">Login to Your Account</a>
            </div>

            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
            
            <p>Happy coding!</p>
            <p><strong>The College Code Hub Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 College Code Hub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getRejectionEmailTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Registration Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Registration Update</h1>
            <p>Your registration requires attention</p>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Thank you for your interest in College Code Hub. After reviewing your registration, we were unable to approve your account at this time.</p>
            
            <p>This could be due to:</p>
            <ul>
              <li>Incomplete or inaccurate information</li>
              <li>Invalid college credentials</li>
              <li>Missing required documentation</li>
            </ul>

            <p>If you believe this is an error or would like to provide additional information, please contact our support team.</p>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/contact" class="button">Contact Support</a>
            </div>

            <p>We appreciate your understanding and look forward to welcoming you to our community in the future.</p>
            
            <p>Best regards,<br><strong>The College Code Hub Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 College Code Hub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const subject = 'Welcome to College Code Hub!';
    const html = this.getWelcomeEmailTemplate(userName);

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  private getWelcomeEmailTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to College Code Hub</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Welcome to College Code Hub!</h1>
            <p>Your coding journey starts here</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Welcome to College Code Hub! We're excited to have you join our community of passionate coders and problem solvers.</p>
            
            <p>Here's what you can do on our platform:</p>
            <ul>
              <li>🎯 Solve coding problems of various difficulty levels</li>
              <li>🏆 Compete in coding competitions</li>
              <li>👥 Connect with fellow students from your college</li>
              <li>📊 Track your progress and achievements</li>
              <li>💼 Build your coding portfolio</li>
            </ul>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/problems" class="button">Start Solving Problems</a>
            </div>

            <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
            
            <p>Happy coding!</p>
            <p><strong>The College Code Hub Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 College Code Hub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();
