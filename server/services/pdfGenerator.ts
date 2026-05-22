// server/services/pdfGenerator.ts
import puppeteer from 'puppeteer';

interface QuotationItem {
  name: string;
  description?: string;
  qty: number;
  price: number;
  customPrice?: boolean;
}

interface Quotation {
  _id: any;
  quoteNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerLocation?: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  tax: number;
  taxRate: number;
  total: number;
  shippingInfo?: {
    areaName: string;
    cost: number;
    estimatedDelivery?: string;
    freeThreshold?: number;
  };
  notes?: string;
  terms?: string;
  validUntil: Date;
  createdAt: Date;
  status: string;
}

interface Customer {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
}

interface CompanySettings {
  companyName?: string;
  slogan?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: { url?: string; fileId?: string; type?: string };
}

/**
 * Generate PDF buffer for quotation (server-side)
 * Uses puppeteer for reliable PDF generation on the server
 */
export async function generateQuotationPDFBuffer(
  quotation: Quotation,
  customer: Customer,
  settings: CompanySettings | null
): Promise<Buffer> {
  const companyName = settings?.companyName || 'PLASMA WATER AFRICA';
  const companySlogan = settings?.slogan || 'Quality Water Solutions';
  const companyAddress = settings?.address || 'P.O BOX 4996-00200, NAIROBI, KENYA';
  const companyPhone = settings?.phone || '0710743793';
  const companyEmail = settings?.email || 'plasmawaterafrica@gmail.com';
  const logoUrl = settings?.logo?.url || '/logo1.png';
  const taxRate = quotation.taxRate || 0.16;

  function escapeHtml(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // HTML template for PDF
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Playfair+Display:ital@0;1&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #ffffff;
          padding: 60px 50px 50px 50px;
          line-height: 1.4;
        }
        .pdf-container { max-width: 1000px; margin: 0 auto; background: white; }
        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 45px;
          padding-bottom: 30px;
          border-bottom: 2px solid #f0f2f5;
        }
        .company-logo { height: 80px; width: auto; object-fit: contain; }
        .quote-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 700;
          color: #0a2540;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }
        .quote-number {
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          font-family: 'Inter', monospace;
        }
        .contact-line {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          font-size: 10px;
          color: #6b7280;
          margin-bottom: 4px;
        }
        .info-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 35px;
        }
        .info-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
          padding-bottom: 8px;
          border-bottom: 2px solid #f0f2f5;
        }
        .info-card-header h3 {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #9ca3af;
        }
        .customer-name {
          font-size: 16px;
          font-weight: 700;
          color: #0a2540;
          margin-bottom: 8px;
        }
        .detail-row {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 6px;
        }
        .detail-label {
          font-size: 11px;
          font-weight: 600;
          color: #9ca3af;
          min-width: 85px;
          text-transform: uppercase;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 35px;
        }
        .items-table th {
          text-align: left;
          padding: 12px 8px;
          background: #f8fafc;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          border-bottom: 2px solid #e2e8f0;
        }
        .items-table td {
          padding: 12px 8px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 12px;
          color: #334155;
        }
        .item-name { font-weight: 600; color: #0f172a; font-size: 13px; }
        .totals-wrapper {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 35px;
          padding-top: 16px;
          border-top: 2px solid #f0f2f5;
        }
        .totals-box { width: 340px; }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 12px;
          border-bottom: 1px solid #f3f4f6;
        }
        .total-row.grand-total {
          padding-top: 12px;
          border-top: 2px solid #0a2540;
          border-bottom: none;
        }
        .grand-total-amount {
          font-size: 22px;
          font-weight: 800;
          color: #0a2540;
        }
        .payment-section {
          margin-bottom: 30px;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          overflow: hidden;
        }
        .payment-header {
          background: #0a2540;
          padding: 14px 24px;
        }
        .payment-header h4 {
          color: white;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .payment-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .payment-method {
          padding: 20px 24px;
        }
        .payment-method:first-child { border-right: 1px solid #e5e7eb; }
        .payment-method-title {
          font-size: 14px;
          font-weight: 700;
          color: #0a2540;
        }
        .payment-detail {
          display: flex;
          gap: 12px;
          font-size: 11px;
          margin-bottom: 8px;
        }
        .payment-detail-key {
          color: #9ca3af;
          min-width: 85px;
        }
        .footer {
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid #f0f2f5;
        }
        .footer-slogan {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 8px;
        }
        .footer-copyright { font-size: 9px; color: #cbd5e1; }
      </style>
    </head>
    <body>
      <div class="pdf-container">
        <div class="header">
          <div><img src="${logoUrl}" class="company-logo" alt="Logo" /></div>
          <div class="quote-info">
            <div class="quote-title">QUOTATION</div>
            <div class="quote-number">${quotation.quoteNumber}</div>
          </div>
          <div>
            <div class="contact-line">📍 ${escapeHtml(companyAddress)}</div>
            <div class="contact-line">📞 ${escapeHtml(companyPhone)}</div>
            ${companyEmail ? `<div class="contact-line">✉️ ${escapeHtml(companyEmail)}</div>` : ''}
          </div>
        </div>

        <div class="info-section">
          <div>
            <div class="info-card-header"><h3>BILL TO</h3></div>
            <div class="customer-name">${escapeHtml(customer.name)}</div>
            ${customer.email ? `<div class="detail-row"><span class="detail-label">Email</span><span>${escapeHtml(customer.email)}</span></div>` : ''}
            ${customer.phone ? `<div class="detail-row"><span class="detail-label">Phone</span><span>${escapeHtml(customer.phone)}</span></div>` : ''}
            ${customer.location ? `<div class="detail-row"><span class="detail-label">Location</span><span>${escapeHtml(customer.location)}</span></div>` : ''}
          </div>
          <div>
            <div class="info-card-header"><h3>QUOTE DETAILS</h3></div>
            <div class="detail-row"><span class="detail-label">Date Issued</span><span>${new Date(quotation.createdAt).toLocaleDateString()}</span></div>
            <div class="detail-row"><span class="detail-label">Valid Until</span><span>${new Date(quotation.validUntil).toLocaleDateString()}</span></div>
            <div class="detail-row"><span class="detail-label">Status</span><span>${quotation.status.toUpperCase()}</span></div>
          </div>
        </div>

        <table class="items-table">
          <thead><tr><th>Item Description</th><th>Qty</th><th>Unit Price (KES)</th><th>Total (KES)</th></tr></thead>
          <tbody>
            ${quotation.items.map(item => `
              <tr>
                <td><div class="item-name">${escapeHtml(item.name)}</div>${item.description ? `<div style="font-size:10px;color:#94a3b8">${escapeHtml(item.description.substring(0, 100))}</div>` : ''}</td>
                <td>${item.qty}</td>
                <td>${item.price.toLocaleString()}</td>
                <td>${(item.price * item.qty).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals-wrapper">
          <div class="totals-box">
            <div class="total-row"><span>Subtotal</span><span>KES ${(quotation.subtotal || 0).toLocaleString()}</span></div>
            ${quotation.discount > 0 ? `<div class="total-row" style="color:#dc2626"><span>Discount</span><span>-KES ${quotation.discount.toLocaleString()}</span></div>` : ''}
            ${quotation.shippingInfo?.cost ? `<div class="total-row"><span>Shipping</span><span>KES ${quotation.shippingInfo.cost.toLocaleString()}</span></div>` : ''}
            <div class="total-row"><span>Tax (${(taxRate * 100).toFixed(0)}% VAT)</span><span>KES ${(quotation.tax || 0).toLocaleString()}</span></div>
            <div class="total-row grand-total"><span class="grand-total-label">Total Amount</span><span class="grand-total-amount">KES ${(quotation.total || 0).toLocaleString()}</span></div>
          </div>
        </div>

        <div class="payment-section">
          <div class="payment-header"><h4>Payment Information</h4></div>
          <div class="payment-body">
            <div class="payment-method">
              <div class="payment-method-title">KCB Bank Kenya</div>
              <div class="payment-detail"><span class="payment-detail-key">Account Name</span><span>${escapeHtml(companyName)}</span></div>
              <div class="payment-detail"><span class="payment-detail-key">Account Number</span><span>1312281278</span></div>
              <div class="payment-detail"><span class="payment-detail-key">Branch</span><span>Moi Avenue</span></div>
            </div>
            <div class="payment-method">
              <div class="payment-method-title">M-PESA</div>
              <div class="payment-detail"><span class="payment-detail-key">Paybill/Till</span><span>9114123</span></div>
              <div class="payment-detail"><span class="payment-detail-key">Account Name</span><span>${escapeHtml(companyName)}</span></div>
              <div class="payment-detail"><span class="payment-detail-key">Payment Terms</span><span>Full payment prior to supply</span></div>
            </div>
          </div>
        </div>

        ${quotation.notes ? `
          <div style="background:#fffbeb;padding:14px 20px;border-radius:12px;margin-bottom:16px;border-left:3px solid #f59e0b">
            <div style="font-size:10px;font-weight:700;color:#b45309">Notes</div>
            <div style="font-size:11px;color:#78350f">${escapeHtml(quotation.notes)}</div>
          </div>
        ` : ''}

        ${quotation.terms ? `
          <div style="background:#f8fafc;padding:14px 20px;border-radius:12px;margin-bottom:30px;border-left:3px solid #94a3b8">
            <div style="font-size:10px;font-weight:700;color:#475569">Terms & Conditions</div>
            <div style="font-size:11px;color:#334155">${escapeHtml(quotation.terms)}</div>
          </div>
        ` : ''}

        <div class="footer">
          <div class="footer-slogan">${escapeHtml(companySlogan)}</div>
          <div class="footer-copyright">
            This quotation is valid until ${new Date(quotation.validUntil).toLocaleDateString()}<br/>
            © ${new Date().getFullYear()} ${escapeHtml(companyName)}. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Launch puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Fix: Use correct waitUntil options - 'networkidle0' is valid but TypeScript may complain
  // Use type assertion to fix the TypeScript error
  await page.setContent(html, { 
    waitUntil: 'networkidle0' as any 
  });
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      bottom: '20mm',
      left: '15mm',
      right: '15mm'
    }
  });
  
  await browser.close();
  return Buffer.from(pdfBuffer);
}