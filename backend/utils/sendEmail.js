const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// Cache test account globally to prevent 5-10 second delay on every OTP request
let cachedTestAccount = null;

const sendEmail = async (options) => {
  // Option 1: Use Resend API (Bypasses Render's Port 587 block)
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    try {
      const data = await resend.emails.send({
        from: 'CCMS Admin <onboarding@resend.dev>', // Must use this until domain is verified in Resend
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`,
      });
      console.log('Resend Email sent successfully:', data);
      return;
    } catch (error) {
      console.log('Resend Error:', error.message);
      return;
    }
  }

  // Option 2: Use SMTP (Blocked by Render Free Tier)
  let transporter;
  let fromEmail = process.env.FROM_EMAIL || 'noreply@ccms.gov.in';

  if (process.env.SMTP_HOST && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
    // Use real SMTP server
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // Generate a test account for development if no real SMTP is provided
    if (!cachedTestAccount) {
      cachedTestAccount = await nodemailer.createTestAccount();
    }
    
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: cachedTestAccount.user, // generated ethereal user
        pass: cachedTestAccount.pass, // generated ethereal password
      },
    });
    fromEmail = cachedTestAccount.user;
  }

  const message = {
    from: `${process.env.FROM_NAME || 'CCMS Admin'} <${fromEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`,
  };

  // Log the email content for development purposes
  console.log('----------------------------------------------------');
  console.log(`Email intended for: ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Message:\n${options.message}`);
  console.log('----------------------------------------------------');

  try {
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
    
    // Preview only available when sending through an Ethereal account
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.log('Nodemailer Error:', error.message);
    // We swallow the error so development can continue without a real SMTP server.
  }
};

module.exports = sendEmail;
