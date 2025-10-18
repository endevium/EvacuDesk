module.exports = function otpEmail(otp) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
      <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); padding: 30px;">
        <h2 style="text-align: center; color: #45AD7F;">Email Verification</h2>
        <p style="font-size: 16px; color: #333;">
          Hello,
        </p>
        <p style="font-size: 15px; color: #333;">
          Please use the verification code below to complete your verification process:
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
          If you did not request this verification, please ignore this email.
        </p>
      </div>
    </div>
  `;
};
