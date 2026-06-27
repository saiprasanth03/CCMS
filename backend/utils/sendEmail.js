const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// Cache test account globally to prevent 5-10 second delay on every OTP request
let cachedTestAccount = null;

const sendEmail = async (options) => {
  // Option 1: Use Custom Google Apps Script API (100% Free, Bypasses All Firewalls)
  if (process.env.GOOGLE_SCRIPT_URL) {
    try {
      const response = await fetch(process.env.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: options.email,
          subject: options.subject,
          html: options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`
        })
      });
      
      const result = await response.text();
      if (result !== 'Success') {
        throw new Error('Google Script failed to send email');
      }
      
      console.log('Google Script Email sent successfully to:', options.email);
      return;
    } catch (error) {
      console.log('Google Script Error:', error.message);
      throw error;
    }
  }

  // Option 2: Use Resend API
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
      if (data.error) throw new Error(data.error.message);
      console.log('Resend Email sent successfully:', data);
      return;
    } catch (error) {
      console.log('Resend Error:', error.message);
      throw error;
    }
  }

  // Option 3: Use Ethereal Test Account (Fallback)
  if (!cachedTestAccount) {
    cachedTestAccount = await nodemailer.createTestAccount();
  }
  
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: cachedTestAccount.user,
      pass: cachedTestAccount.pass,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'CCMS Admin'} <${cachedTestAccount.user}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`,
  };

  // Log the email content for development purposes
  console.log('----------------------------------------------------');
  console.log(`Email intended for: ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log('----------------------------------------------------');

  try {
    const info = await transporter.sendMail(message);
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.log('Nodemailer Error:', error.message);
  }
};

module.exports = sendEmail;
