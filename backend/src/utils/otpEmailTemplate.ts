interface OtpEmailTemplateParams {
  otp: string;
}

export function otpEmailTemplate({ otp }: OtpEmailTemplateParams): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login OTP</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f6f8;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
          Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif;
        color: #333333;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }
      .header {
        background-color: #0f172a;
        padding: 20px 30px;
        color: #ffffff;
      }
      .header h1 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }
      .content {
        padding: 30px;
      }
      .content p {
        font-size: 14px;
        line-height: 1.6;
        margin: 0 0 16px 0;
      }
      .otp-box {
        margin: 24px 0;
        text-align: center;
      }
      .otp {
        display: inline-block;
        padding: 12px 24px;
        font-size: 24px;
        font-weight: 600;
        letter-spacing: 4px;
        color: #0f172a;
        background-color: #f1f5f9;
        border-radius: 6px;
      }
      .footer {
        padding: 20px 30px;
        background-color: #f8fafc;
        font-size: 12px;
        color: #64748b;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Login Verification</h1>
      </div>

      <div class="content">
        <p>Hello,</p>

        <p>
          We received a request to sign in to your account. Please use the
          one-time password (OTP) below to complete your login.
        </p>

        <div class="otp-box">
          <div class="otp">${otp}</div>
        </div>

        <p>
          This OTP is valid for <strong>5 minutes</strong>. Do not share this
          code with anyone.
        </p>

        <p>
          If you did not request this login, you can safely ignore this email.
        </p>

        <p>
          Regards,<br />
          <strong>Security Team</strong>
        </p>
      </div>

      <div class="footer">
        <p>This is an automated message. Please do not reply.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}
