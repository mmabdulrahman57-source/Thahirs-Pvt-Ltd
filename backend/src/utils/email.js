import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email skipped - no SMTP] To: ${to}, Subject: ${subject}`);
    return { success: false, skipped: true };
  }
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'info@thahirsgroup.com',
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (err) {
    console.error('Email error:', err.message);
    return { success: false, error: err.message };
  }
};

const baseStyle = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">`;
const footer = `<br><p style="color:#666;font-size:12px">Best regards,<br><strong>THAHIRS (PVT) LTD</strong><br>No. 5, Quarry Road, Colombo 12<br>Phone: +94 11 2424999</p></div>`;

const money = (n) => `LKR ${(Number(n) || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const quotationSummaryHtml = (q) => {
  const vatPct = q.vatPercentage ?? 18;
  const vatAmount = q.vatAmount ?? q.vat ?? 0;
  const net = q.netAmount ?? Math.max(0, (Number(q.subtotal) || 0) - (Number(q.discount) || 0));
  return `
  <p><strong>Subtotal:</strong> ${money(q.subtotal)}</p>
  <p><strong>Discount:</strong> ${money(q.discount)}</p>
  <p><strong>Net Amount:</strong> ${money(net)}</p>
  <p><strong>VAT (${vatPct}%):</strong> ${money(vatAmount)}</p>
  <p><strong>Grand Total:</strong> ${money(q.totalAmount)}</p>`;
};

export const quotationReceivedEmail = (q) => `${baseStyle}
  <h2 style="color:#F97316">New Quotation Request</h2>
  <p><strong>Reference:</strong> ${q.reference}</p>
  <p><strong>Customer:</strong> ${q.customer?.name}</p>
  <p><strong>Company:</strong> ${q.customer?.company || 'N/A'}</p>
  <p><strong>Email:</strong> ${q.customer?.email}</p>
  <p><strong>Phone:</strong> ${q.customer?.phone || 'N/A'}</p>
  <p><strong>Items:</strong> ${q.items?.length || 0}</p>
  <p>Please review in the Admin Panel.</p>${footer}`;

export const quotationSentEmail = (q) => `${baseStyle}
  <h2 style="color:#F97316">Your Quotation is Ready</h2>
  <p>Dear ${q.customer?.name},</p>
  <p>Your quotation <strong>${q.reference}</strong> has been prepared.</p>
  ${quotationSummaryHtml(q)}
  <p>Log in to your customer portal to view details, download PDF, and accept or request revisions.</p>${footer}`;

export const quotationReminderEmail = (q) => `${baseStyle}
  <h2 style="color:#F97316">Quotation Reminder</h2>
  <p>Dear ${q.customer?.name},</p>
  <p>This is a reminder that quotation <strong>${q.reference}</strong> is valid until ${q.validUntil || 'soon'}.</p>
  ${quotationSummaryHtml(q)}${footer}`;

export const quotationAcceptedEmail = (q) => `${baseStyle}
  <h2 style="color:#16a34a">Quotation Accepted</h2>
  <p>Customer <strong>${q.customer?.name}</strong> accepted quotation ${q.reference}.</p>${footer}`;

export const quotationRejectedEmail = (q) => `${baseStyle}
  <h2 style="color:#dc2626">Quotation Rejected</h2>
  <p>Customer <strong>${q.customer?.name}</strong> rejected quotation ${q.reference}.</p>
  ${q.customerResponse ? `<p><strong>Reason:</strong> ${q.customerResponse}</p>` : ''}${footer}`;

export const quotationRevisionEmail = (q) => `${baseStyle}
  <h2 style="color:#F97316">Revised Quotation</h2>
  <p>Dear ${q.customer?.name},</p>
  <p>A revised quotation <strong>${q.reference}</strong> (v${q.version || '1.1'}) is available.</p>
  ${quotationSummaryHtml(q)}${footer}`;
