// app/sales/quotations/components/QuotationPDF.tsx
'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateQuotationPDF(
  quote: any,
  customer: any,
  settings: any,
  logoUrl: string | null
): Promise<Blob> {
  const element = document.createElement('div');
  element.style.position = 'absolute';
  element.style.top = '-9999px';
  element.style.left = '-9999px';
  element.style.width = '1100px';
  element.style.backgroundColor = '#ffffff';
  element.style.padding = '0';
  element.style.margin = '0';

  const finalLogoUrl = logoUrl || '/logo1.png';
  const mpesaLogoUrl = '/logo.png';
  const kcbLogoUrl = '/logo.png';
  const companyName = settings?.companyName || 'PLASMA WATER AFRICA';
  const companySlogan = settings?.slogan || 'Quality Water Solutions';
  const companyAddress = settings?.address || 'P.O BOX 4996-00200, NAIROBI, KENYA';
  const companyPhone = settings?.phone || '0710743793';
  const companyEmail = settings?.email || 'plasmawaterafrica@gmail.com';
  const taxRate = quote.taxRate || 0.16;

  function escapeHtml(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Minimal SVG icons
  const icons = {
    location: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    phone: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    email: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    calendar: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    clock: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    user: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    package: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.8"><path d="M12 2l-10 5.5 10 5.5 10-5.5L12 2z"/><path d="M12 12v10"/><path d="M2 7.5v9l10 5.5 10-5.5v-9"/></svg>`,
    truck: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    check: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`,
  };

  element.innerHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Playfair+Display:ital@0;1&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #ffffff;
          padding: 60px 50px 50px 50px;
          line-height: 1.4;
        }

        .pdf-container {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
        }

        /* HEADER SECTION */
        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 45px;
          padding-bottom: 30px;
          border-bottom: 2px solid #f0f2f5;
        }

        .logo-area {
          flex: 0 0 auto;
        }

        .company-logo {
          height: 160px;
          width: auto;
          object-fit: contain;
          display: block;
        }

        .quote-info {
          text-align: center;
          flex: 1;
        }

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
          letter-spacing: 0.5px;
        }

        .company-contact {
          text-align: right;
          flex: 0 0 auto;
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

        /* INFO SECTION - Clean cards */
        .info-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 35px;
        }

        .info-card {
          padding: 20px 0;
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

        .info-content {
          font-size: 13px;
          color: #374151;
          line-height: 1.7;
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
          letter-spacing: 0.3px;
        }

        .detail-value {
          font-size: 12px;
          color: #374151;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: #ecfdf5;
          color: #059669;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        /* SHIPPING INFO */
        .shipping-info {
          background: linear-gradient(135deg, #f0fdf9 0%, #ecfdf5 100%);
          padding: 14px 20px;
          border-radius: 12px;
          margin-bottom: 35px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid #d1fae5;
        }

        .shipping-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .shipping-label {
          font-size: 10px;
          font-weight: 600;
          color: #047857;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .shipping-value {
          font-size: 12px;
          font-weight: 500;
          color: #065f46;
        }

        /* ITEMS TABLE */
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
          letter-spacing: 0.8px;
          color: #64748b;
          border-bottom: 2px solid #e2e8f0;
        }

        .items-table td {
          padding: 12px 8px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 12px;
          color: #334155;
          vertical-align: top;
        }

        .item-name {
          font-weight: 600;
          color: #0f172a;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .item-description {
          font-size: 10px;
          color: #94a3b8;
          line-height: 1.4;
          margin-top: 3px;
        }

        .custom-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #eff6ff;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 9px;
          color: #2563eb;
          font-weight: 500;
          margin-top: 4px;
        }

        .text-right {
          text-align: right;
        }

        .text-center {
          text-align: center;
        }

        .font-mono {
          font-family: 'Inter', monospace;
          font-weight: 500;
        }

        /* TOTALS */
        .totals-wrapper {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 35px;
          padding-top: 16px;
          border-top: 2px solid #f0f2f5;
        }

        .totals-box {
          width: 340px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          font-size: 12px;
          color: #4b5563;
          border-bottom: 1px solid #f3f4f6;
        }

        .total-row.discount {
          color: #dc2626;
        }

        .total-row.grand-total {
          padding-top: 12px;
          margin-top: 8px;
          border-top: 2px solid #0a2540;
          border-bottom: none;
        }

        .grand-total-label {
          font-size: 16px;
          font-weight: 700;
          color: #0a2540;
        }

        .grand-total-amount {
          font-size: 22px;
          font-weight: 800;
          color: #0a2540;
          letter-spacing: -0.5px;
        }

        /* PAYMENT SECTION */
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
          letter-spacing: 1.5px;
        }

        .payment-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }

        .payment-method {
          padding: 20px 24px;
        }

        .payment-method:first-child {
          border-right: 1px solid #e5e7eb;
        }

        .payment-method-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .payment-logo {
          height: 40px;
          width: auto;
          object-fit: contain;
        }

        .payment-method-title {
          font-size: 14px;
          font-weight: 700;
          color: #0a2540;
        }

        .payment-method-sub {
          font-size: 10px;
          color: #6b7280;
          margin-top: 2px;
        }

        .payment-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .payment-detail {
          display: flex;
          gap: 12px;
          font-size: 11px;
        }

        .payment-detail-key {
          color: #9ca3af;
          font-weight: 500;
          min-width: 85px;
        }

        .payment-detail-value {
          color: #1f2937;
          font-weight: 500;
          font-family: 'Inter', monospace;
        }

        /* NOTES & TERMS */
        .notes-box {
          background: #fffbeb;
          padding: 14px 20px;
          border-radius: 12px;
          margin-bottom: 16px;
          border-left: 3px solid #f59e0b;
        }

        .notes-title {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #b45309;
          margin-bottom: 6px;
        }

        .notes-text {
          font-size: 11px;
          color: #78350f;
          line-height: 1.5;
        }

        .terms-box {
          background: #f8fafc;
          padding: 14px 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          border-left: 3px solid #94a3b8;
        }

        .terms-title {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #475569;
          margin-bottom: 6px;
        }

        .terms-text {
          font-size: 11px;
          color: #334155;
          line-height: 1.5;
        }

        /* FOOTER */
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

        .footer-copyright {
          font-size: 9px;
          color: #cbd5e1;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="pdf-container">
        <!-- HEADER - Logo only, no company name text -->
        <div class="header">
          <div class="logo-area">
            <img src="${finalLogoUrl}" class="company-logo" alt="Logo" crossorigin="anonymous" />
          </div>
          <div class="quote-info">
            <div class="quote-title">QUOTATION</div>
            <div class="quote-number">${quote.quoteNumber}</div>
          </div>
          <div class="company-contact">
            <div class="contact-line">${icons.location} ${escapeHtml(companyAddress)}</div>
            <div class="contact-line">${icons.phone} ${escapeHtml(companyPhone)}</div>
            ${companyEmail ? `<div class="contact-line">${icons.email} ${escapeHtml(companyEmail)}</div>` : ''}
          </div>
        </div>

        <!-- INFO SECTION - Clean without boxes -->
        <div class="info-section">
          <!-- Bill To -->
          <div class="info-card">
            <div class="info-card-header">
              ${icons.user}
              <h3>Bill To</h3>
            </div>
            <div class="info-content">
              <div class="customer-name">${escapeHtml(customer.name)}</div>
              ${customer.email ? `<div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${escapeHtml(customer.email)}</span></div>` : ''}
              ${customer.phone ? `<div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${escapeHtml(customer.phone)}</span></div>` : ''}
              ${customer.location ? `<div class="detail-row"><span class="detail-label">Location</span><span class="detail-value">${escapeHtml(customer.location)}</span></div>` : ''}
            </div>
          </div>

          <!-- Quote Details -->
          <div class="info-card">
            <div class="info-card-header">
              ${icons.package}
              <h3>Quote Details</h3>
            </div>
            <div class="info-content">
              <div class="detail-row">
                <span class="detail-label">Date Issued</span>
                <span class="detail-value">${new Date(quote.createdAt).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Valid Until</span>
                <span class="detail-value">${new Date(quote.validUntil).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="detail-value">
                  <span class="status-badge">
                    ${icons.check}
                    ${quote.status.toUpperCase()}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- SHIPPING INFO -->
        ${quote.shippingInfo ? `
          <div class="shipping-info">
            <div class="shipping-item">
              ${icons.truck}
              <div>
                <div class="shipping-label">Shipping Area</div>
                <div class="shipping-value">${escapeHtml(quote.shippingInfo.areaName)}</div>
              </div>
            </div>
            <div class="shipping-item">
              <div>
                <div class="shipping-label">Cost</div>
                <div class="shipping-value">${quote.shippingInfo.freeThreshold > 0 && quote.shippingInfo.cost === 0 ? 'FREE' : `KES ${quote.shippingInfo.cost.toLocaleString()}`}</div>
              </div>
            </div>
            <div class="shipping-item">
              <div>
                <div class="shipping-label">Est. Delivery</div>
                <div class="shipping-value">${escapeHtml(quote.shippingInfo.estimatedDelivery || '3-5 business days')}</div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- ITEMS TABLE -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 45%">Item Description</th>
              <th style="width: 12%" class="text-center">Qty</th>
              <th style="width: 21%" class="text-right">Unit Price (KES)</th>
              <th style="width: 22%" class="text-right">Total (KES)</th>
            </tr>
          </thead>
          <tbody>
            ${quote.items.map((item: any) => `
              <tr>
                <td>
                  <div class="item-name">${escapeHtml(item.name)}</div>
                  ${item.description ? `<div class="item-description">${escapeHtml(item.description.substring(0, 120))}</div>` : ''}
                  ${item.customPrice ? `<div class="custom-badge">${icons.check} Custom pricing applied</div>` : ''}
                </td>
                <td class="text-center font-mono">${item.qty}</td>
                <td class="text-right font-mono">${item.price.toLocaleString()}</td>
                <td class="text-right font-mono" style="font-weight: 600;">${(item.price * item.qty).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- TOTALS -->
        <div class="totals-wrapper">
          <div class="totals-box">
            <div class="total-row">
              <span>Subtotal</span>
              <span class="font-mono">KES ${(quote.subtotal || 0).toLocaleString()}</span>
            </div>
            ${quote.discount > 0 ? `
              <div class="total-row discount">
                <span>Discount (${quote.discountType === 'percentage' ? `${quote.discount}%` : `KES ${quote.discount.toLocaleString()}`})</span>
                <span class="font-mono">-KES ${(quote.discountAmount || quote.discount).toLocaleString()}</span>
              </div>
            ` : ''}
            ${quote.shippingInfo?.cost && quote.shippingInfo.cost > 0 ? `
              <div class="total-row">
                <span>Shipping</span>
                <span class="font-mono">KES ${quote.shippingInfo.cost.toLocaleString()}</span>
              </div>
            ` : ''}
            <div class="total-row">
              <span>Tax (${(taxRate * 100).toFixed(0)}% VAT)</span>
              <span class="font-mono">KES ${(quote.tax || 0).toLocaleString()}</span>
            </div>
            <div class="total-row grand-total">
              <span class="grand-total-label">Total Amount</span>
              <span class="grand-total-amount">KES ${(quote.total || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <!-- PAYMENT SECTION -->
        <div class="payment-section">
          <div class="payment-header">
            <h4>Payment Information</h4>
          </div>
          <div class="payment-body">
            <!-- KCB Bank -->
            <div class="payment-method">
              <div class="payment-method-header">
                <img src="${kcbLogoUrl}" class="payment-logo" alt="KCB Bank" crossorigin="anonymous" 
                  onerror="this.style.display='none'" />
                <div>
                  <div class="payment-method-title">KCB Bank Kenya</div>
                  <div class="payment-method-sub">Bank Transfer</div>
                </div>
              </div>
              <div class="payment-details">
                <div class="payment-detail">
                  <span class="payment-detail-key">Account Name</span>
                  <span class="payment-detail-value">${escapeHtml(companyName)}</span>
                </div>
                <div class="payment-detail">
                  <span class="payment-detail-key">Account Number</span>
                  <span class="payment-detail-value">1312281278</span>
                </div>
                <div class="payment-detail">
                  <span class="payment-detail-key">Branch</span>
                  <span class="payment-detail-value">Moi Avenue</span>
                </div>
              </div>
            </div>

            <!-- M-PESA -->
            <div class="payment-method">
              <div class="payment-method-header">
                <img src="${mpesaLogoUrl}" class="payment-logo" alt="M-PESA" crossorigin="anonymous"
                  onerror="this.style.display='none'" />
                <div>
                  <div class="payment-method-title">M-PESA</div>
                  <div class="payment-method-sub">Mobile Money</div>
                </div>
              </div>
              <div class="payment-details">
                <div class="payment-detail">
                  <span class="payment-detail-key">Paybill/Till</span>
                  <span class="payment-detail-value">9114123</span>
                </div>
                <div class="payment-detail">
                  <span class="payment-detail-key">Account Name</span>
                  <span class="payment-detail-value">${escapeHtml(companyName)}</span>
                </div>
                <div class="payment-detail">
                  <span class="payment-detail-key">Payment Terms</span>
                  <span class="payment-detail-value">Full payment prior to supply</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- NOTES -->
        ${quote.notes ? `
          <div class="notes-box">
            <div class="notes-title">Notes</div>
            <div class="notes-text">${escapeHtml(quote.notes)}</div>
          </div>
        ` : ''}

        <!-- TERMS -->
        ${quote.terms ? `
          <div class="terms-box">
            <div class="terms-title">Terms & Conditions</div>
            <div class="terms-text">${escapeHtml(quote.terms)}</div>
          </div>
        ` : ''}

        <!-- FOOTER -->
        <div class="footer">
          <div class="footer-slogan">${escapeHtml(companySlogan)}</div>
          <div class="footer-copyright">
            This quotation is valid until ${new Date(quote.validUntil).toLocaleDateString()}<br/>
            © ${new Date().getFullYear()} ${escapeHtml(companyName)}. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  document.body.appendChild(element);

  // Wait for images to load
  const images = element.querySelectorAll('img');
  await Promise.race([
    Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete && img.naturalHeight !== 0) {
              resolve(null);
            } else {
              img.onload = resolve;
              img.onerror = resolve;
              setTimeout(resolve, 3000);
            }
          })
      )
    ),
    new Promise((resolve) => setTimeout(resolve, 4000)),
  ]);

  await new Promise((resolve) => setTimeout(resolve, 200));

  const canvas = await html2canvas(element, {
    scale: 2.5,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true,
    allowTaint: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  document.body.removeChild(element);

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

  if (pdfHeight > pageHeight) {
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, -pageHeight, pdfWidth, pdfHeight);
  }

  return pdf.output('blob');
}