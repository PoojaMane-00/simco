const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'novamiinfotechs.com', // Replace with your SMTP server
    port: 465, // Common for SSL; use 587 for TLS
    secure: true, // true for port 465, false for 587
    auth: {
      user: 'admin@novamiinfotechs.com', // Your full email address
      pass: 'admin@novamiinfotechs.com' // Your actual email password
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certs if needed
    }
  });

exports.sendApprovalEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: '"SIMCo Node Project" <admin@novamiinfotechs.com>', // include sender email
    to,
    subject,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📨 Message ID:', info.messageId);
    console.log('📬 Response:', info.response);
    return info;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    console.error('🔍 Full error:', error);
    throw error; // rethrow to handle in calling function if needed
  }
};

exports.sendApprovalEmailWithAttachment = async (to, subject, textContent, pdfBuffer, filename) => {
  const mailOptions = {
    from: '"SIMCo Node Project" <admin@novamiinfotechs.com>',
    to,
    subject,
    text: textContent, // plain text fallback
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email with PDF sent successfully!");
    console.log("📨 Message ID:", info.messageId);
    console.log("📬 Response:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Failed to send email with attachment:", error.message);
    console.error("🔍 Full error:", error);
    throw error;
  }
};

