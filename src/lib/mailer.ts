import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtpro.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const info = await transporter.sendMail({
    from: `HydraBytes <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
  return info;
}
