import { getTaxSettings, roundMoney } from './taxSettings.js';

export const QUOTATION_STATUSES = [
  'draft', 'new_request', 'under_review', 'awaiting_pricing', 'price_added',
  'manager_approval', 'ready_to_send', 'sent_to_customer', 'customer_viewed',
  'customer_accepted', 'customer_rejected', 'expired', 'converted_to_order',
  'completed', 'cancelled',
];

export const LEGACY_STATUS_MAP = {
  pending: 'new_request',
  new: 'new_request',
  reviewing: 'under_review',
  approved: 'sent_to_customer',
  quoted: 'sent_to_customer',
  waiting_customer: 'sent_to_customer',
  rejected: 'customer_rejected',
  completed: 'completed',
  cancelled: 'cancelled',
};

export const PRICING_VISIBLE_STATUSES = new Set([
  'price_added', 'manager_approval', 'ready_to_send', 'sent_to_customer',
  'customer_viewed', 'customer_accepted', 'customer_rejected', 'converted_to_order', 'completed',
]);

export const CUSTOMER_SENT_STATUSES = new Set([
  'sent_to_customer', 'customer_viewed', 'customer_accepted', 'customer_rejected',
  'converted_to_order', 'completed',
]);

export function normalizeStatus(status) {
  return LEGACY_STATUS_MAP[status] || status || 'new_request';
}

export function generateReference() {
  return `THQ-${Date.now().toString(36).toUpperCase()}`;
}

export function calculateItemTotal(item) {
  const qty = Number(item.quantity) || 0;
  const unitPrice = Number(item.unitPrice) || 0;
  const itemDiscount = Number(item.discount) || 0;
  const lineTotal = Math.max(0, qty * unitPrice - itemDiscount);
  return { ...item, vat: 0, totalPrice: roundMoney(lineTotal) };
}

export function calculateQuotationTotals(data, taxSettings = null) {
  const tax = taxSettings || getTaxSettings();
  const vatRate = tax.enabled && tax.autoApply ? Number(tax.vatPercentage) || 0 : 0;

  const items = (data.items || []).map(calculateItemTotal);
  const linesSubtotal = items.reduce((s, i) => s + (Number(i.totalPrice) || 0), 0);

  const charges = data.charges || {};
  const deliveryCharges = Number(charges.delivery) || Number(data.deliveryCharges) || 0;
  const serviceCharge = Number(charges.service) || 0;
  const chargeTotal = deliveryCharges + serviceCharge;

  const subtotal = roundMoney(linesSubtotal + chargeTotal);
  const discount = roundMoney(Number(data.discount) || 0);
  const netAmount = roundMoney(Math.max(0, subtotal - discount));
  const vatAmount = vatRate > 0 ? roundMoney(netAmount * (vatRate / 100)) : 0;
  const totalAmount = roundMoney(netAmount + vatAmount);

  return {
    items,
    subtotal,
    discount,
    netAmount,
    vatPercentage: vatRate,
    vat: vatAmount,
    vatAmount,
    deliveryCharges,
    totalAmount,
    charges: {
      delivery: deliveryCharges,
      packing: Number(charges.packing) || 0,
      installation: Number(charges.installation) || 0,
      service: serviceCharge,
      freight: Number(charges.freight) || 0,
      insurance: Number(charges.insurance) || 0,
      other: Number(charges.other) || 0,
    },
  };
}

export function addTimelineEntry(quotation, { action, message, userId, userName }) {
  const timeline = quotation.timeline || [];
  timeline.push({
    action,
    message,
    userId: userId || null,
    userName: userName || 'System',
    timestamp: new Date().toISOString(),
  });
  return timeline;
}

export function addRevision(quotation, { editedBy, editedByName, changes }) {
  const revisions = quotation.revisions || [];
  const version = revisions.length ? revisions[revisions.length - 1].version + 0.1 : 1.0;
  revisions.push({
    version: Math.round(version * 10) / 10,
    date: new Date().toISOString(),
    editedBy,
    editedByName,
    changes,
  });
  return revisions;
}

export function sanitizeForCustomer(quotation) {
  const status = normalizeStatus(quotation.status);
  const showPricing = CUSTOMER_SENT_STATUSES.has(status);
  const copy = { ...quotation, status };
  delete copy.adminNotes;
  delete copy.internalNotes;
  delete copy.pricingNotes;
  delete copy.approvalComments;
  delete copy.followUpNotes;
  delete copy.discussionLog;
  if (!showPricing) {
    delete copy.subtotal;
    delete copy.discount;
    delete copy.netAmount;
    delete copy.vat;
    delete copy.vatAmount;
    delete copy.vatPercentage;
    delete copy.deliveryCharges;
    delete copy.totalAmount;
    delete copy.charges;
    copy.items = (copy.items || []).map(({ unitPrice, totalPrice, discount, vat, ...rest }) => rest);
  }
  return copy;
}

export function getDashboardStats(quotes) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const normalized = quotes.map(q => ({ ...q, status: normalizeStatus(q.status) }));

  const count = (status) => normalized.filter(q => q.status === status).length;
  const monthQuotes = normalized.filter(q => {
    const d = new Date(q.createdAt);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  return {
    total: normalized.length,
    newRequests: count('new_request'),
    pendingReview: count('under_review') + count('awaiting_pricing'),
    priceAdded: count('price_added'),
    sentToCustomer: count('sent_to_customer') + count('customer_viewed'),
    customerAccepted: count('customer_accepted') + count('converted_to_order'),
    customerRejected: count('customer_rejected'),
    expired: count('expired'),
    completedOrders: count('completed'),
    cancelled: count('cancelled'),
    totalValue: normalized.reduce((s, q) => s + (Number(q.totalAmount) || 0), 0),
    thisMonth: monthQuotes.length,
    thisMonthValue: monthQuotes.reduce((s, q) => s + (Number(q.totalAmount) || 0), 0),
  };
}

export function filterQuotations(quotes, query = {}) {
  let result = quotes.map(q => ({ ...q, status: normalizeStatus(q.status) }));

  if (query.status) result = result.filter(q => q.status === query.status);
  if (query.priority) result = result.filter(q => q.priority === query.priority);
  if (query.assignedTo) result = result.filter(q => q.assignedTo === query.assignedTo);
  if (query.dateFrom) result = result.filter(q => q.createdAt >= query.dateFrom);
  if (query.dateTo) result = result.filter(q => q.createdAt <= query.dateTo + 'T23:59:59');

  if (query.search) {
    const s = query.search.toLowerCase();
    result = result.filter(q => {
      const c = q.customer || {};
      return (
        q.reference?.toLowerCase().includes(s) ||
        c.name?.toLowerCase().includes(s) ||
        c.company?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s) ||
        c.phone?.includes(s) ||
        (q.items || []).some(i => i.productName?.toLowerCase().includes(s))
      );
    });
  }

  return result.reverse();
}
