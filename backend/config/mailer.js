const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not your login password)
  },
});

const sendOTPEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"ReadTogether 📚" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Your ReadTogether verification code",
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 32px; background: #0d0d0d; color: #f0ead8; border-radius: 4px;">
        <h2 style="font-size: 24px; font-weight: 300; letter-spacing: 0.04em; margin: 0 0 8px;">
          📚 ReadTogether
        </h2>
        <p style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #c8a96e; margin: 0 0 32px;">
          Email Verification
        </p>
        <p style="font-size: 15px; color: #c0b89a; line-height: 1.6; margin: 0 0 32px;">
          Use the code below to verify your email address. It expires in <strong style="color: #f0ead8;">10 minutes</strong>.
        </p>
        <div style="text-align: center; padding: 28px; background: rgba(200,169,110,0.08); border: 1px solid rgba(200,169,110,0.25); border-radius: 2px; margin-bottom: 32px;">
          <span style="font-size: 40px; font-weight: 300; letter-spacing: 0.3em; color: #c8a96e; font-family: 'Courier New', monospace;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 12px; color: #666; line-height: 1.6;">
          If you didn't create a ReadTogether account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail };