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

  const autoReply = `Hi ${name},\n\nThank you for reaching out to Elite Touch Sports. We've received your enquiry and will be in touch with you shortly.\n\nBest regards,\nElite Touch Sports`;

  try {
    await transporter.sendMail({
      from: `ETS Website <${process.env.GMAIL_USER}>`,
      to: 'enquiries@elitetouchsports.co.uk',
      subject: 'New Enquiry — Elite Touch Sports Website',
      replyTo: email,
      text: body,
    });

    await transporter.sendMail({
      from: `Elite Touch Sports <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'We received your enquiry — Elite Touch Sports',
      text: autoReply,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Failed to send email' });
  }
};
