const emailjs = require('@emailjs/nodejs');

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_pt6nicj';
const EMAILJS_TEMPLATE_ID = 'template_gmtbb2d';
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY; // You'll need to set this in your .env
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY; // You'll need to set this in your .env

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
async function sendOTPEmail(email, otp) {
  try {
    const templateParams = {
      to_email: email,
      otp_code: otp,
      to_name: email.split('@')[0] // Use email prefix as name
    };

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAILJS_PUBLIC_KEY,
        privateKey: EMAILJS_PRIVATE_KEY
      }
    );

    console.log('OTP email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}

module.exports = {
  generateOTP,
  sendOTPEmail
};