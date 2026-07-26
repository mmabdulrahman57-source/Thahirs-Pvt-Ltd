import PDFDocument from 'pdfkit';
import { getSettings } from '../jsonStore.js';

const fmt = (n) => `LKR ${(Number(n) || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const summaryLines = (quotation) => {
  const vatPct = quotation.vatPercentage ?? 18;
  const vatAmount = quotation.vatAmount ?? quotation.vat ?? 0;
  return [
    ['Subtotal:', fmt(quotation.subtotal)],
    ['Discount:', fmt(quotation.discount)],
    ['Net Amount:', fmt(quotation.netAmount ?? Math.max(0, (Number(quotation.subtotal) || 0) - (Number(quotation.discount) || 0)))],
    [`VAT (${vatPct}%):`, fmt(vatAmount)],
  ];
};

export const generateQuotationPDF = (quotation) => {
  return new Promise((resolve, reject) => {
    const settings = getSettings();
    const company = settings.website || {};
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(22).fillColor('#F97316').text(company.companyName || 'THAHIRS (PVT) LTD', { align: 'center' });
    doc.fillColor('#333').fontSize(9);
    doc.text(company.address || 'No. 5, Quarry Road, Colombo 12, Sri Lanka', { align: 'center' });
    doc.text(`Tel: ${company.phone || '+94 11 2424999'} | Email: ${company.email || 'info@thahirsgroup.com'}`, { align: 'center' });
    doc.text(company.website || 'www.thahirsgroup.com', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#F97316');
    doc.moveDown();

    doc.fontSize(16).fillColor('#111').text('QUOTATION', { align: 'right' });
    doc.fontSize(10).text(`Quotation No: ${quotation.reference}`, { align: 'right' });
    doc.text(`Date: ${new Date(quotation.createdAt || Date.now()).toLocaleDateString()}`, { align: 'right' });
    if (quotation.version) doc.text(`Version: ${quotation.version}`, { align: 'right' });
    doc.moveDown();

    // Customer
    const c = quotation.customer || {};
    doc.fontSize(11).fillColor('#F97316').text('Bill To:');
    doc.fillColor('#333').fontSize(10);
    doc.text(c.name || 'N/A');
    if (c.company) doc.text(c.company);
    if (c.address || c.billingAddress) doc.text(c.billingAddress || c.address);
    if (c.deliveryAddress && c.deliveryAddress !== c.address) doc.text(`Delivery: ${c.deliveryAddress}`);
    doc.text(`Email: ${c.email || 'N/A'} | Phone: ${c.phone || 'N/A'}`);
    doc.moveDown();

    // Table header
    const tableTop = doc.y;
    const cols = [50, 80, 200, 280, 330, 380, 430, 490];
    doc.fontSize(9).fillColor('#fff');
    doc.rect(50, tableTop, 495, 18).fill('#F97316');
    doc.fillColor('#fff').text('#', cols[0] + 2, tableTop + 4, { width: 25 });
    doc.text('Product', cols[1], tableTop + 4, { width: 115 });
    doc.text('Qty', cols[3], tableTop + 4, { width: 40 });
    doc.text('Unit', cols[4], tableTop + 4, { width: 40 });
    doc.text('Price', cols[5], tableTop + 4, { width: 45 });
    doc.text('Disc', cols[6], tableTop + 4, { width: 35 });
    doc.text('Amount', cols[7], tableTop + 4, { width: 55 });

    let y = tableTop + 22;
    doc.fillColor('#333');
    (quotation.items || []).forEach((item, i) => {
      if (y > 680) { doc.addPage(); y = 50; }
      const bg = i % 2 === 0 ? '#f9f9f9' : '#fff';
      doc.rect(50, y - 2, 495, 16).fill(bg);
      doc.fillColor('#333').fontSize(8);
      doc.text(String(i + 1), cols[0] + 2, y);
      doc.text((item.productName || item.description || '').slice(0, 30), cols[1], y, { width: 115 });
      doc.text(String(item.quantity || 0), cols[3], y);
      doc.text(item.unit || 'pcs', cols[4], y);
      doc.text(fmt(item.unitPrice).replace('LKR ', ''), cols[5], y);
      doc.text(String(item.discount || 0), cols[6], y);
      doc.text(fmt(item.totalPrice).replace('LKR ', ''), cols[7], y);
      y += 16;
    });

    doc.moveDown();
    y = Math.max(y + 10, doc.y);
    const summaryX = 350;
    doc.fontSize(10).fillColor('#333');
    const lines = summaryLines(quotation);

    lines.forEach(([label, val]) => { doc.text(label, summaryX, y); doc.text(val, summaryX + 100, y, { align: 'right', width: 95 }); y += 14; });
    doc.moveTo(summaryX, y).lineTo(545, y).stroke('#ccc');
    y += 6;
    doc.fontSize(13).fillColor('#F97316').text('Grand Total:', summaryX, y);
    doc.text(fmt(quotation.totalAmount), summaryX + 100, y, { align: 'right', width: 95 });

    // Terms
    y += 30;
    if (y > 650) { doc.addPage(); y = 50; }
    doc.fontSize(10).fillColor('#F97316').text('Commercial Terms', 50, y);
    y += 14;
    doc.fillColor('#333').fontSize(9);
    const terms = [
      ['Payment Terms', quotation.paymentTerms],
      ['Delivery Period', quotation.deliveryTime],
      ['Warranty', quotation.warranty],
      ['Validity', quotation.validityPeriod ? `${quotation.validityPeriod} days` : quotation.validUntil],
      ['Currency', quotation.currency || 'LKR'],
      ['Incoterms', quotation.incoterms],
    ].filter(([, v]) => v);
    terms.forEach(([k, v]) => { doc.text(`${k}: ${v}`, 50, y); y += 12; });

    if (quotation.customerNotes) {
      y += 8;
      doc.fontSize(10).fillColor('#F97316').text('Notes', 50, y);
      y += 12;
      doc.fillColor('#333').fontSize(9).text(quotation.customerNotes, 50, y, { width: 495 });
    }

    // Footer
    doc.fontSize(8).fillColor('#999');
    doc.text('This is a computer-generated quotation from THAHIRS (PVT) LTD.', 50, 750, { align: 'center', width: 495 });
    doc.text('Bank: Commercial Bank of Ceylon | Account: THAHIRS (PVT) LTD', 50, 762, { align: 'center', width: 495 });

    doc.end();
  });
};
