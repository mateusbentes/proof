const nodemailer = require('nodemailer');

let transporter;

const initializeEmailService = () => {
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
};

const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    console.warn('Email service not configured. Skipping email send.');
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};

const sendWelcomeEmail = async (email, username) => {
  const html = `
    <h1>Welcome to Proof, ${username}!</h1>
    <p>Thank you for joining our community. We're excited to have you here.</p>
    <p>Complete your profile and start exploring communities.</p>
    <a href="${process.env.FRONTEND_URL}/profile">Complete Your Profile</a>
  `;

  await sendEmail(email, 'Welcome to Proof', html);
};

const sendVerificationEmail = async (email, verificationLink) => {
  const html = `
    <h1>Verify Your Email</h1>
    <p>Click the link below to verify your email address:</p>
    <a href="${verificationLink}">Verify Email</a>
  `;

  await sendEmail(email, 'Verify Your Email', html);
};

const sendPasswordResetEmail = async (email, resetLink) => {
  const html = `
    <h1>Reset Your Password</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>This link expires in 1 hour.</p>
  `;

  await sendEmail(email, 'Reset Your Password', html);
};

const sendModerationNotification = async (email, action, reason) => {
  const html = `
    <h1>Moderation Action</h1>
    <p>Your account has been subject to a moderation action.</p>
    <p><strong>Action:</strong> ${action}</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p>If you believe this is a mistake, please contact our support team.</p>
  `;

  await sendEmail(email, 'Moderation Action', html);
};

const sendReportNotification = async (email, reportId, reason) => {
  const html = `
    <h1>Report Received</h1>
    <p>We've received your report (ID: ${reportId}).</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p>Our moderation team will review it shortly.</p>
  `;

  await sendEmail(email, 'Report Received', html);
};

const sendCommunityNotification = async (email, communityName, message) => {
  const html = `
    <h1>${communityName}</h1>
    <p>${message}</p>
  `;

  await sendEmail(email, `Notification from ${communityName}`, html);
};

module.exports = {
  initializeEmailService,
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendModerationNotification,
  sendReportNotification,
  sendCommunityNotification,
};
