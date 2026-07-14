const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { name, email, phone, message, company } = req.body || {};

  // Honeypot: real visitors never fill this in. Pretend success so bots don't learn they were caught.
  if (company) {
    return res.status(200).json({ ok: true });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Invalid email address' });
  }
  if (name.length > 200 || email.length > 200 || message.length > 5000 || (phone && phone.length > 40)) {
    return res.status(400).json({ ok: false, error: 'Input too long' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const body = `New enquiry from the Elite Touch Sports website:\n\nName:    ${name.trim()}\nEmail:   ${email.trim()}\nPhone:   ${(phone || '—').trim()}\nMessage: ${message.trim()}`;

  try {
    await transporter.sendMail({
      from: `"Elite Touch Sports" <${process.env.GMAIL_USER}>`,
      to: 'enquiries@elitetouchsports.co.uk',
      subject: 'New Enquiry — Elite Touch Sports Website',
      replyTo: email.trim(),
      text: body,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('SMTP error:', err.message, err.code, err.response);
    return res.status(500).json({ ok: false, error: 'Failed to send email' });
  }
};
