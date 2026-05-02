const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { Resend } = require('resend');

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields.'
      });
    }

    // Save to MongoDB
    const contact = new Contact({ name, email, phone, service, message });
    await contact.save();
    console.log(`Contact saved to DB: ${name} <${email}>`);

    // Send email via Resend
    const apiKey = process.env.RESEND_API_KEY;
    const emailTo = process.env.EMAIL_TO;

    console.log(`RESEND_API_KEY present: ${!!apiKey}`);
    console.log(`EMAIL_TO: ${emailTo}`);

    if (apiKey && emailTo) {
      try {
        const resend = new Resend(apiKey);

        const result = await resend.emails.send({
          // IMPORTANT: on Resend free plan, from must use onboarding@resend.dev
          // and to must be the email you signed up with on resend.com
          from: 'Olatech Website <onboarding@resend.dev>',
          to: emailTo,
          reply_to: email,
          subject: `New enquiry from ${name} — Olatech Website`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;">
              <div style="background:#2563eb;padding:28px 32px;">
                <h2 style="color:#ffffff;margin:0;font-size:20px;">New Contact Form Message</h2>
                <p style="color:#bfdbfe;margin:6px 0 0;font-size:13px;">Olatech IT Global Website</p>
              </div>
              <div style="padding:32px;background:#f9fafb;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:10px 0;color:#6b7280;font-size:13px;width:110px;vertical-align:top;"><strong>Name</strong></td>
                    <td style="padding:10px 0;font-size:14px;color:#111827;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;color:#6b7280;font-size:13px;vertical-align:top;"><strong>Email</strong></td>
                    <td style="padding:10px 0;font-size:14px;color:#111827;"><a href="mailto:${email}" style="color:#2563eb;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;color:#6b7280;font-size:13px;vertical-align:top;"><strong>Phone</strong></td>
                    <td style="padding:10px 0;font-size:14px;color:#111827;">${phone || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;color:#6b7280;font-size:13px;vertical-align:top;"><strong>Service</strong></td>
                    <td style="padding:10px 0;font-size:14px;color:#111827;">${service || 'Not specified'}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;color:#6b7280;font-size:13px;vertical-align:top;"><strong>Message</strong></td>
                    <td style="padding:10px 0;font-size:14px;color:#111827;line-height:1.6;">${message}</td>
                  </tr>
                </table>
              </div>
              <div style="background:#eff6ff;padding:16px 32px;border-top:1px solid #dbeafe;">
                <p style="margin:0;font-size:12px;color:#6b7280;">
                  Hit Reply to respond directly to ${name} at ${email}
                </p>
              </div>
            </div>
          `
        });

        console.log('Resend response:', JSON.stringify(result));

        if (result.error) {
          console.error('Resend returned error:', result.error);
        } else {
          console.log(`Email sent successfully. ID: ${result.data?.id}`);
        }

      } catch (emailErr) {
        console.error('Resend threw exception:', emailErr.message);
        console.error('Full error:', JSON.stringify(emailErr));
      }
    } else {
      console.warn('Email not sent — RESEND_API_KEY or EMAIL_TO is missing from environment variables');
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out. We will get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again or contact us directly.'
    });
  }
});

// GET /api/contact — view all submissions
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
