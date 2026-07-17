import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.ethereal.email',
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
}

/**
 * Send a contact notification email to the admin.
 */
export async function sendContactNotification({ name, email, phone, subject, message }) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM || `Portfolio <${process.env.SMTP_USER}>`,
    to:      process.env.EMAIL_TO   || process.env.SMTP_USER,
    subject: `[Portfolio] New message from ${name}: ${subject || '(no subject)'}`,
    text: [
      `Name:    ${name}`,
      `Email:   ${email}`,
      `Phone:   ${phone || 'N/A'}`,
      `Subject: ${subject || 'N/A'}`,
      '',
      message,
    ].join('\n'),
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px 24px;background:#f9f9f9;border-radius:10px;">
        <h2 style="margin:0 0 20px;font-size:20px;">New message from <strong>${name}</strong></h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="padding:8px 0;color:#666;font-size:13px;width:90px;">Name</td><td style="padding:8px 0;font-size:13px;">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px;">Email</td><td style="padding:8px 0;font-size:13px;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px;">Phone</td><td style="padding:8px 0;font-size:13px;">${phone || 'N/A'}</td></tr>
          <tr><td style="padding:8px 0;color:#666;font-size:13px;">Subject</td><td style="padding:8px 0;font-size:13px;">${subject || 'N/A'}</td></tr>
        </table>
        <div style="background:#fff;border-left:3px solid #7c5cff;padding:16px 20px;border-radius:0 8px 8px 0;font-size:13px;line-height:1.7;color:#333;">${message.replace(/\n/g, '<br>')}</div>
        <p style="margin:20px 0 0;font-size:11px;color:#aaa;">Received at ${new Date().toLocaleString()} · Portfolio Admin</p>
      </div>
    `,
  });
}

/**
 * Send a reply email to the person who contacted.
 */
export async function sendReplyEmail({ to, toName, subject, replyBody }) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM || `Portfolio <${process.env.SMTP_USER}>`,
    to:      `${toName} <${to}>`,
    subject: `Re: ${subject || 'Your message'}`,
    text:    replyBody,
    html:    `<div style="font-family:sans-serif;max-width:560px;margin:auto;">${replyBody.replace(/\n/g, '<br>')}</div>`,
  });
}
