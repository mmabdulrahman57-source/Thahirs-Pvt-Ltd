export const QUOTATION_STATUSES = [
  'draft', 'new_request', 'under_review', 'awaiting_pricing', 'price_added',
  'manager_approval', 'ready_to_send', 'sent_to_customer', 'customer_viewed',
  'customer_accepted', 'customer_rejected', 'expired', 'converted_to_order',
  'completed', 'cancelled',
] as const;

export type QuotationStatus = typeof QUOTATION_STATUSES[number];

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft', new_request: 'New Request', under_review: 'Under Review',
  awaiting_pricing: 'Awaiting Pricing', price_added: 'Price Added',
  manager_approval: 'Manager Approval', ready_to_send: 'Ready to Send',
  sent_to_customer: 'Sent to Customer', customer_viewed: 'Customer Viewed',
  customer_accepted: 'Customer Accepted', customer_rejected: 'Customer Rejected',
  expired: 'Expired', converted_to_order: 'Converted to Order',
  completed: 'Completed', cancelled: 'Cancelled',
  pending: 'New Request', reviewing: 'Under Review', approved: 'Sent to Customer',
  quoted: 'Sent to Customer', rejected: 'Customer Rejected', waiting_customer: 'Sent to Customer',
};

export interface QuotationItem {
  productName: string;
  productCode?: string;
  productId?: string;
  category?: string;
  preferredBrand?: string;
  description?: string;
  quantity: number;
  unit: string;
  requiredDate?: string;
  deliveryLocation?: string;
  specialNotes?: string;
  referenceFile?: string;
  unitPrice?: number;
  discount?: number;
  vat?: number;
  totalPrice?: number;
}

export interface QuotationCharges {
  delivery?: number;
  packing?: number;
  installation?: number;
  service?: number;
  freight?: number;
  insurance?: number;
  other?: number;
}

export interface TaxSettings {
  vatPercentage: number;
  enabled: boolean;
  autoApply: boolean;
}

export interface QuotationCustomer {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  billingAddress?: string;
  deliveryAddress?: string;
}

export interface Quotation {
  _id: string;
  reference: string;
  status: string;
  priority?: string;
  customer: QuotationCustomer;
  items: QuotationItem[];
  subtotal?: number;
  discount?: number;
  netAmount?: number;
  vat?: number;
  vatAmount?: number;
  vatPercentage?: number;
  deliveryCharges?: number;
  charges?: QuotationCharges;
  totalAmount?: number;
  paymentTerms?: string;
  deliveryTime?: string;
  warranty?: string;
  validityPeriod?: number;
  validUntil?: string;
  currency?: string;
  incoterms?: string;
  installationDetails?: string;
  afterSalesSupport?: string;
  customerNotes?: string;
  adminNotes?: string;
  internalNotes?: string;
  pricingNotes?: string;
  approvalComments?: string;
  followUpNotes?: string;
  assignedTo?: string;
  requiredDeliveryDate?: string;
  version?: number;
  timeline?: Array<{ action: string; message: string; userName: string; timestamp: string }>;
  revisions?: Array<{ version: number; date: string; editedByName: string; changes: string }>;
  customerHistory?: Quotation[];
  createdAt: string;
  updatedAt?: string;
}

export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  vatPercentage: 18,
  enabled: true,
  autoApply: true,
};

export function roundMoney(value: number) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

/** Allow typing prices as plain text, e.g. 1500 or 1500.50 */
export function sanitizeMoneyInput(raw: string) {
  let s = raw.replace(/[^\d.]/g, '');
  const dot = s.indexOf('.');
  if (dot !== -1) {
    s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '');
  }
  const [, frac] = s.split('.');
  if (frac !== undefined && frac.length > 2) {
    const [whole] = s.split('.');
    s = `${whole}.${frac.slice(0, 2)}`;
  }
  return s;
}

export function parseMoneyInput(raw: string) {
  const s = sanitizeMoneyInput(raw.trim());
  if (!s || s === '.') return 0;
  return roundMoney(parseFloat(s) || 0);
}

export function formatMoney(value: number, currency = 'LKR') {
  return `${currency} ${roundMoney(value).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function normalizeStatus(s: string) {
  const map: Record<string, string> = {
    pending: 'new_request', new: 'new_request', reviewing: 'under_review',
    approved: 'sent_to_customer', quoted: 'sent_to_customer',
    waiting_customer: 'sent_to_customer', rejected: 'customer_rejected',
  };
  return map[s] || s || 'new_request';
}

export function statusLabel(s: string) {
  return STATUS_LABELS[s] || STATUS_LABELS[normalizeStatus(s)] || s.replace(/_/g, ' ');
}

export function canCustomerSeePricing(s: string) {
  return ['sent_to_customer', 'customer_viewed', 'customer_accepted', 'customer_rejected', 'converted_to_order', 'completed'].includes(normalizeStatus(s));
}

export function calcTotals(
  items: QuotationItem[],
  discount = 0,
  charges: QuotationCharges = {},
  tax: TaxSettings = DEFAULT_TAX_SETTINGS,
) {
  const priced = items.map(i => {
    const qty = Number(i.quantity) || 0;
    const unitPrice = Number(i.unitPrice) || 0;
    const itemDiscount = Number(i.discount) || 0;
    const lineTotal = Math.max(0, qty * unitPrice - itemDiscount);
    return { ...i, vat: 0, totalPrice: roundMoney(lineTotal) };
  });

  const linesSubtotal = priced.reduce((s, i) => s + (Number(i.totalPrice) || 0), 0);
  const deliveryCharges = Number(charges.delivery) || 0;
  const serviceCharge = Number(charges.service) || 0;
  const chargeTotal = deliveryCharges + serviceCharge;

  const subtotal = roundMoney(linesSubtotal + chargeTotal);
  const discountAmount = roundMoney(discount);
  const netAmount = roundMoney(Math.max(0, subtotal - discountAmount));
  const vatRate = tax.enabled && tax.autoApply ? Number(tax.vatPercentage) || 0 : 0;
  const vatAmount = vatRate > 0 ? roundMoney(netAmount * (vatRate / 100)) : 0;
  const totalAmount = roundMoney(netAmount + vatAmount);

  return {
    items: priced,
    subtotal,
    discount: discountAmount,
    netAmount,
    vatPercentage: vatRate,
    vat: vatAmount,
    vatAmount,
    totalAmount,
  };
}
