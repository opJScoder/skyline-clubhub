const { mailer, env } = require('../config');
async function sendMail(to, subject, html) {
  if (!mailer) { console.log(`[mail:skipped] to=${to} subject="${subject}"`); return true; }
  try { await mailer.sendMail({ from: env.MAIL_FROM, to, subject, html }); return true; }
  catch (e) { console.error('mail failed', to, e.message); return false; }
}
async function broadcast(emails, subject, html, batch = 20) {
  let sent = 0, failed = 0;
  for (let i = 0; i < emails.length; i += batch) {
    const r = await Promise.all(emails.slice(i, i + batch).map(e => sendMail(e, subject, html)));
    r.forEach(ok => (ok ? sent++ : failed++));
  }
  return { sent, failed };
}
module.exports = { sendMail, broadcast };
