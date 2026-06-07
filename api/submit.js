const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { name, email, phone, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Invalid email address' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const body = `New enquiry from the Elite Touch Sports website:\n\nName:    ${name}\nEmail:   ${email}\nPhone:   ${phone || '—'}\nMessage: ${message}`;

  try {
    await transporter.sendMail({
      from: `"Elite Touch Sports" <${process.env.GMAIL_USER}>`,
      to: 'enquiries@elitetouchsports.co.uk',
      subject: 'New Enquiry — Elite Touch Sports Website',
      replyTo: email,
      text: body,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('SMTP error:', err.message, err.code, err.response);
    return res.status(500).json({ ok: false, error: 'Failed to send email' });
  }
};
