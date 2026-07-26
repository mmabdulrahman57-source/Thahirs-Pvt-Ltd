import express from 'express';
import { Quotation, Notification } from '../jsonStore.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import {
  sendEmail, quotationReceivedEmail, quotationSentEmail,
  quotationAcceptedEmail, quotationRejectedEmail,
} from '../utils/email.js';
import { generateQuotationPDF } from '../utils/pdf.js';
import {
  generateReference, normalizeStatus, calculateQuotationTotals,
  addTimelineEntry, sanitizeForCustomer, CUSTOMER_SENT_STATUSES,
} from '../utils/quotationHelpers.js';
import { logActivity } from '../utils/activity.js';

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { customer, items, priority, requiredDeliveryDate } = req.body;
    const timeline = addTimelineEntry({}, {
      action: 'created',
      message: 'Quotation request submitted by customer',
      userId: req.user.id,
      userName: req.user.name || customer?.name,
    });
    const quotation = Quotation.create({
      customer: {
        ...customer,
        billingAddress: customer.billingAddress || customer.address,
        deliveryAddress: customer.deliveryAddress || customer.address,
      },
      items: (items || []).map(i => ({ ...i, unitPrice: 0, totalPrice: 0 })),
      reference: generateReference(),
      status: 'new_request',
      priority: priority || 'normal',
      requiredDeliveryDate,
      version: 1.0,
      timeline,
      charges: {},
      userId: req.user.id,
    });
    Notification.create({ type: 'quotation', title: 'New Quotation Request', message: `${quotation.reference} from ${customer?.name}`, read: false });
    logActivity('quotation', `New quotation ${quotation.reference}`, req.user.id);
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'info@thahirsgroup.com',
      subject: `New Quotation Request - ${quotation.reference}`,
      html: quotationReceivedEmail(quotation),
    });
    res.status(201).json(sanitizeForCustomer(quotation));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/my', authMiddleware, (req, res) => {
  const quotes = Quotation.find({ userId: req.user.id }).reverse().map(sanitizeForCustomer);
  res.json(quotes);
});

router.get('/my/stats', authMiddleware, (req, res) => {
  const quotes = Quotation.find({ userId: req.user.id }).map(q => ({ ...q, status: normalizeStatus(q.status) }));
  res.json({
    total: quotes.length,
    pending: quotes.filter(q => ['new_request', 'under_review', 'awaiting_pricing'].includes(q.status)).length,
    reviewing: quotes.filter(q => q.status === 'under_review').length,
    sent: quotes.filter(q => CUSTOMER_SENT_STATUSES.has(q.status)).length,
    approved: quotes.filter(q => ['customer_accepted', 'converted_to_order', 'completed'].includes(q.status)).length,
    rejected: quotes.filter(q => q.status === 'customer_rejected').length,
  });
});

router.get('/', authMiddleware, adminOnly, (req, res) => {
  res.json(Quotation.find().reverse());
});

router.get('/:id', authMiddleware, (req, res) => {
  const quotation = Quotation.findOne({ _id: req.params.id });
  if (!quotation) return res.status(404).json({ message: 'Not found' });
  if (req.user.role !== 'admin' && quotation.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  if (req.user.role === 'admin') return res.json(quotation);
  res.json(sanitizeForCustomer(quotation));
});

router.put('/:id/respond', authMiddleware, async (req, res) => {
  const quotation = Quotation.findOne({ _id: req.params.id });
  if (!quotation) return res.status(404).json({ message: 'Not found' });
  if (quotation.userId !== req.user.id) return res.status(403).json({ message: 'Access denied' });

  const status = normalizeStatus(quotation.status);
  if (!CUSTOMER_SENT_STATUSES.has(status)) {
    return res.status(400).json({ message: 'Quotation not yet sent to customer' });
  }

  const { action, message } = req.body;
  let newStatus = status;
  if (action === 'accept') newStatus = 'customer_accepted';
  else if (action === 'reject') newStatus = 'customer_rejected';
  else if (action === 'revision') newStatus = 'under_review';
  else return res.status(400).json({ message: 'Invalid action' });

  const timeline = addTimelineEntry(quotation, {
    action,
    message: message || `Customer ${action}ed quotation`,
    userId: req.user.id,
    userName: req.user.name,
  });

  const updated = Quotation.findByIdAndUpdate(req.params.id, {
    status: newStatus,
    customerResponse: message || '',
    customerRespondedAt: new Date().toISOString(),
    timeline,
  });

  Notification.create({
    type: 'quotation',
    title: `Customer ${action}ed ${quotation.reference}`,
    message: message || `Quotation ${quotation.reference} ${action}ed`,
    read: false,
  });

  const emailFn = action === 'accept' ? quotationAcceptedEmail : quotationRejectedEmail;
  await sendEmail({
    to: process.env.ADMIN_EMAIL || 'info@thahirsgroup.com',
    subject: `Quotation ${action}: ${quotation.reference}`,
    html: emailFn(updated),
  });

  res.json(sanitizeForCustomer(updated));
});

router.put('/:id/viewed', authMiddleware, (req, res) => {
  const quotation = Quotation.findOne({ _id: req.params.id });
  if (!quotation || quotation.userId !== req.user.id) return res.status(404).json({ message: 'Not found' });
  if (normalizeStatus(quotation.status) === 'sent_to_customer') {
    const timeline = addTimelineEntry(quotation, { action: 'viewed', message: 'Customer viewed quotation', userId: req.user.id, userName: req.user.name });
    Quotation.findByIdAndUpdate(req.params.id, { status: 'customer_viewed', timeline, viewedAt: new Date().toISOString() });
  }
  res.json({ ok: true });
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const data = { ...req.body };
    const existing = Quotation.findOne({ _id: req.params.id });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    const totals = calculateQuotationTotals({ ...existing, ...data });
    Object.assign(data, totals);

    if (data.status) data.status = normalizeStatus(data.status);
    if (data.validityPeriod && !data.validUntil) {
      const d = new Date();
      d.setDate(d.getDate() + parseInt(data.validityPeriod));
      data.validUntil = d.toISOString().slice(0, 10);
    }

    if (['sent_to_customer', 'ready_to_send'].includes(data.status) && data.totalAmount) {
      data.sentAt = new Date().toISOString();
      data.quotedAt = data.quotedAt || new Date().toISOString();
      data.quotedBy = req.user.id;
    }

    let timeline = existing.timeline || [];
    if (data.status && data.status !== normalizeStatus(existing.status)) {
      timeline = addTimelineEntry({ timeline }, {
        action: 'status_change',
        message: `Status changed to ${data.status.replace(/_/g, ' ')}`,
        userId: req.user.id,
        userName: req.user.name,
      });
      data.timeline = timeline;
    }

    const quotation = Quotation.findByIdAndUpdate(req.params.id, data);
    if (data.sendEmail && ['sent_to_customer', 'ready_to_send'].includes(data.status)) {
      await sendEmail({ to: quotation.customer.email, subject: `Quotation ${quotation.reference} - THAHIRS`, html: quotationSentEmail(quotation) });
      timeline = addTimelineEntry({ timeline }, { action: 'email_sent', message: 'Quotation emailed to customer', userId: req.user.id, userName: req.user.name });
      Quotation.findByIdAndUpdate(req.params.id, { timeline });
    }
    res.json(quotation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/:id/pdf', authMiddleware, async (req, res) => {
  const quotation = Quotation.findOne({ _id: req.params.id });
  if (!quotation) return res.status(404).json({ message: 'Not found' });
  if (req.user.role !== 'admin' && quotation.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  const status = normalizeStatus(quotation.status);
  if (req.user.role !== 'admin' && !CUSTOMER_SENT_STATUSES.has(status)) {
    return res.status(403).json({ message: 'Quotation not yet available' });
  }
  const pdf = await generateQuotationPDF(quotation);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${quotation.reference}.pdf`);
  res.send(pdf);
});

export default router;
