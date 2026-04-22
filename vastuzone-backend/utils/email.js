const nodemailer = require('nodemailer');

// This is a placeholder for real email service integration (SendGrid, AWS SES, etc.)
// For now, it logs to console or uses a test ethereal account if configured.

const sendEmail = async ({ to, subject, text, html }) => {
  console.log(`📧 Sending Email to: ${to}`);
  console.log(`Subject: ${subject}`);
  
  // If SENDGRID_API_KEY is present, you would use @sendgrid/mail
  // If you want to use SMTP:
  /*
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"VastuZone" <noreply@vastuzone.com>',
    to,
    subject,
    text,
    html,
  });
  */

  // Mock success for now
  return { success: true, message: "Email sent (mocked)" };
};

const sendAppointmentConfirmation = async (user, appointment) => {
  return sendEmail({
    to: user.email,
    subject: 'Consultation Confirmed - VastuZone',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #1A1C19;">Consultation Confirmed</h2>
        <p>Dear ${user.name},</p>
        <p>Your Vastu consultation is confirmed for <strong>${appointment.appointmentDate}</strong> at <strong>${appointment.timeSlot}</strong>.</p>
        <p>Please ensure you have completed the payment to receive the meeting link.</p>
        <br />
        <p>Best regards,<br />The VastuZone Team</p>
      </div>
    `
  });
};

const sendPaymentSuccess = async (user, appointment) => {
  return sendEmail({
    to: user.email,
    subject: 'Payment Received - VastuZone',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #1A1C19;">Payment Successful</h2>
        <p>Thank you, ${user.name}. We have received your payment for the consultation.</p>
        <p>You can now access the Google Meet link in your dashboard.</p>
        <br />
        <p>Best regards,<br />The VastuZone Team</p>
      </div>
    `
  });
};

module.exports = {
  sendEmail,
  sendAppointmentConfirmation,
  sendPaymentSuccess
};
