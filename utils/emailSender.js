const transporter = require("../services/nodemailer");

/**
 * @param {string} to 
 * @param {string} name 
 * @param {string} otp 
 * @param {string} purpose 
 */
exports.emailSender = async (to, name, otp, purpose = "verify") => {
  const isReset = purpose === "reset";
  const subject = isReset ? "Reset Account Password" : "Verify Gmail Account";
  const title = isReset ? "Password Reset" : "Email Verification";
  const message = isReset
    ? `We received a request to reset your password. Use the code below to continue:`
    : `Please use the verification code below to complete your email verification:`;

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
      <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); padding: 30px;">
        <h2 style="text-align: center; color: #45AD7F;">${title}</h2>
        <p style="font-size: 16px; color: #333;">
          Hello ${name || ""},
        </p>
        <p style="font-size: 15px; color: #333;">
          ${message}
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <span style="display: inline-block; background-color: #45AD7F; color: white; font-size: 24px; font-weight: bold; padding: 12px 24px; border-radius: 6px; letter-spacing: 3px;">
            ${otp}
          </span>
        </div>

        <p style="font-size: 15px; color: #333;">
          This code will expire in <strong>15 minutes</strong>.
        </p>

        <p style="color: #d9534f; font-weight: bold; font-size: 14px;">
          ⚠️ Do NOT share this code with anyone. We will never ask for it.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">

        <p style="font-size: 13px; color: #777; text-align: center;">
          If you did not request this ${isReset ? "password reset" : "verification"}, please ignore this email.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `EvacuDesk <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};
