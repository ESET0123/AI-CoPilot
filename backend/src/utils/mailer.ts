// import nodemailer from 'nodemailer';

// export const mailer = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
// });

// export async function sendVerificationEmail(
//   to: string,
//   token: string
// ) {
//   const verifyUrl = `http://localhost:5000/auth/verify-email?token=${token}`;

//   await mailer.sendMail({
//     from: `"Chatbot" <${process.env.MAIL_USER}>`,
//     to,
//     subject: 'Verify your email',
//     html: `
//       <h3>Verify your email</h3>
//       <p>Click the link below:</p>
//       <a href="${verifyUrl}">${verifyUrl}</a>
//     `,
//   });
// }
export async function sendVerificationEmail(
  to: string,
  token: string
) {
  const link = `http://localhost:5000/auth/verify-email?token=${token}`;

  console.log('===================================');
  console.log('📧 EMAIL VERIFICATION (DEV MODE)');
  console.log('To:', to);
  console.log('Verify URL:', link);
  console.log('===================================');

  return;
}
