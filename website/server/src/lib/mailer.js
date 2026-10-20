import nodemailer from 'nodemailer';

let transport;

function getTransport() {
  if (transport !== undefined) return transport;
  if (!process.env.SMTP_HOST) {
    transport = null;
    return transport;
  }
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transport;
}

const escape = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Emails the welcome team about a new "Plan Your Visit" request. No-op when SMTP isn't configured. */
export async function notifyVisit(visit) {
  const t = getTransport();
  if (!t || !process.env.NOTIFY_EMAIL) return;
  const rows = [
    ['Name', visit.full_name],
    ['Email', visit.email],
    ['Phone', visit.phone || '—'],
    ['Submitted from', visit.source || '—'],
  ];
  await t.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: process.env.NOTIFY_EMAIL,
    replyTo: visit.email,
    subject: `New visit request: ${visit.full_name}`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
    html: `<h2>New “Plan Your Visit” request</h2><table>${rows
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0"><b>${k}</b></td><td>${escape(v)}</td></tr>`)
      .join('')}</table>`,
  });
}

/** Emails the church office about a new Contact page enquiry. No-op when SMTP isn't configured. */
export async function notifyEnquiry(e) {
  const t = getTransport();
  if (!t || !process.env.NOTIFY_EMAIL) return;
  const rows = [
    ['Name', e.full_name],
    ['Email', e.email],
    ['Phone', e.phone || '—'],
    ['Enquiry type', e.intent],
    ['About', e.subject || '—'],
    ['Message', e.message],
  ];
  await t.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: process.env.NOTIFY_EMAIL,
    replyTo: e.email,
    subject: `New ${e.intent} enquiry: ${e.full_name}`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
    html: `<h2>New website enquiry</h2><table>${rows
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;vertical-align:top"><b>${k}</b></td><td style="white-space:pre-wrap">${escape(v)}</td></tr>`)
      .join('')}</table>`,
  });
}
