const express  = require('express');
const router   = express.Router();
const { Resend } = require('resend');
const Contact  = require('../models/Contact');

// POST only — public submission
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required' });
    }

    const contact = await Contact.create({ name, email, phone, service, message });

    // Send email notification
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from:    'Olatech Website <onboarding@resend.dev>',
        to:      process.env.EMAIL_TO || 'olakanmiquadri@gmail.com',
        subject: `New message from ${name}`,
        html:    `<h2>New Contact Form Submission</h2>
                  <p><strong>Name:</strong> ${name}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                  <p><strong>Service:</strong> ${service || 'Not specified'}</p>
                  <p><strong>Message:</strong></p>
                  <p>${message}</p>`
      });
    } catch (emailErr) {
      console.error('Email send error:', emailErr.message);
    }

    res.status(201).json({ success: true, message: 'Message received. We will get back to you within 24 hours.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

// Block all other methods on /api/contact
router.get('/',    (req, res) => res.status(403).json({ success: false, message: 'Forbidden' }));
router.put('/',    (req, res) => res.status(403).json({ success: false, message: 'Forbidden' }));
router.delete('/', (req, res) => res.status(403).json({ success: false, message: 'Forbidden' }));
router.patch('/',  (req, res) => res.status(403).json({ success: false, message: 'Forbidden' }));

module.exports = router;
