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
  // Logo paths
  const finalLogoUrl = logoUrl || '/logo1.png';
  const mpesaLogoUrl = '/mpesa-logo.png';
  const kcbLogoUrl = '/kcb-logo.png';
  const footerLogoUrl = '/logo.png';
  
  const companyName = settings?.companyName || 'PLASMA WATER AFRICA';
  const companySlogan = settings?.slogan || 'Quality Water Solutions';
  const taxRate = quote.taxRate || 0.16;
  const partnerLogos = [
    { src: '/logo/dayliff.png', name: 'Dayliff' },
    { src: '/logo/taflo.png', name: 'Taflo' },
    { src: '/logo/pedrollo.png', name: 'Pedrollo' },
    { src: '/logo/grundfos.png', name: 'Grundfos' },
  ];

  // Get transport info
  const transportCost = quote.transportCost || quote.transportInfo?.cost || 0;
  const transportDescription = quote.transportDescription || quote.transportInfo?.description || '';
  const estimatedDelivery = quote.estimatedDelivery || quote.shippingInfo?.estimatedDelivery || '';
  
  // Tax calculation mode
  const taxPerItem = quote.taxPerItem || false;
  const displayTaxableBadges = !!taxPerItem;

  let calculatedSubtotal = 0;
  let calculatedTax = 0;

  const itemsWithCalculations = quote.items.map((item: any) => {
    const qty = Number(item.qty || 0);
    const unitPrice = Number(item.price || 0);

    const itemTotal = unitPrice * qty;
    calculatedSubtotal += itemTotal;

    const isTaxable = taxPerItem ? item.taxable !== false : false;
    const itemTax = (taxPerItem && isTaxable) ? itemTotal * taxRate : 0;

    if (itemTax > 0) calculatedTax += itemTax;

    return {
      ...item,
      qty,
      unitPrice,
      itemTotal,
      itemTax,
      isTaxable,
    };
  });

  const discountAmount = quote.discountType === 'percentage'
    ? calculatedSubtotal * ((quote.discount || 0) / 100)
    : (quote.discount || 0);

  if (!taxPerItem) {
    const taxableAmount = Math.max(0, calculatedSubtotal - discountAmount);
    calculatedTax = taxableAmount * taxRate;
  }

  const calculatedTotal = calculatedSubtotal - discountAmount + calculatedTax + transportCost;

  function escapeHtml(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const icons = {
    location: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7c8a" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    phone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7c8a" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    email: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7c8a" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    calendar: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7c8a" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    user: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7c8a" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    package: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7c8a" stroke-width="1.8"><path d="M12 2l-10 5.5 10 5.5 10-5.5L12 2z"/><path d="M12 12v10"/><path d="M2 7.5v9l10 5.5 10-5.5v-9"/></svg>`,
    truck: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2c6e3c" stroke-width="2"><path d="M1 3h15v13H1z"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2c6e3c" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`,
    creditCard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7c8a" stroke-width="1.8"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
    tax: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="3"/></svg>`,
  };

  // ALWAYS SHOW QUOTATION (never invoice)
  const getHeaderHTML = () => `
    <div class="header">
      <div class="company-info">
        <div class="company-name">PLASMA WATER AFRICA</div>
        <div class="company-address">P.O BOX 4996-00200</div>
        <div class="company-location">NAIROBI, KENYA</div>
        <div class="company-tel">TEL: 0710743793</div>
        <div class="company-email">Email: plasmawaterafrica@gmail.com</div>
      </div>
      <div class="logo-area">
        <img src="${finalLogoUrl}" class="company-logo" alt="Logo" crossorigin="anonymous" />
      </div>
    </div>

    <div class="doc-title-section doc-title-quotation">
      <div class="doc-title-container">
        <div class="doc-title-text text-quotation">QUOTATION</div>
      </div>
    </div>
  `;

  // Updated Routing Logic: 3 items or less = single page, otherwise 2 pages
  const shouldUseTwoPages = itemsWithCalculations.length > 3;
  
  // Items distribution
  const page1Items = shouldUseTwoPages ? itemsWithCalculations.slice(0, 9) : itemsWithCalculations;
  const page2Items = shouldUseTwoPages ? itemsWithCalculations.slice(9) : [];

  // Determine where totals panel goes
  const showTotalsOnPage1 = !shouldUseTwoPages || (shouldUseTwoPages && page2Items.length === 0);
  const showTotalsOnPage2 = shouldUseTwoPages && page2Items.length > 0;

  // Items Table Markup Engine
  const getItemsTableHTML = (itemsList: any[]) => `
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 45%">Item Description</th>
          <th style="width: 10%" class="text-center">Qty</th>
          <th style="width: 20%" class="text-right">Unit Price (KES)</th>
          ${taxPerItem ? `<th style="width: 12%" class="text-center">Tax (${(taxRate * 100).toFixed(0)}%)</th>` : ''}
          <th style="width: ${taxPerItem ? '13%' : '25%'}" class="text-right">Total (KES)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsList.map((item: any) => `
          <tr>
            <td>
              <div class="item-name">${escapeHtml(item.name)}</div>
              ${item.description ? `<div class="item-description">${escapeHtml(item.description.substring(0, 120))}</div>` : ''}
            </td>
            <td class="text-center">${item.qty}</td>
            <td class="text-right">
              ${item.unitPrice.toLocaleString()}

            </td>
            ${taxPerItem ? `
              <td class="text-center" style="${item.isTaxable ? 'color: #2c6e3c; font-weight: 600;' : 'color: #b46f0b;'}">
                ${item.isTaxable ? `KES ${item.itemTax.toLocaleString()}` : 'Exempt'}
              </td>
            ` : ''}
            <td class="text-right" style="font-weight: 600;">${(item.itemTotal + (displayTaxableBadges ? item.itemTax : 0)).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // Extracted Totals Box Component
  const totalsBoxHTML = `
    <div class="totals-wrapper">
      <div class="totals-box">
        <div class="total-row">
          <span>Subtotal</span>
          <span>KES ${calculatedSubtotal.toLocaleString()}</span>
        </div>
        ${quote.discount > 0 ? `
          <div class="total-row discount">
            <span>Discount (${quote.discountType === 'percentage' ? `${quote.discount}%` : `KES ${quote.discount.toLocaleString()}`})</span>
            <span>-KES ${discountAmount.toLocaleString()}</span>
          </div>
        ` : ''}
        ${transportCost > 0 ? `
          <div class="total-row">
            <span>Transport</span>
            <span>KES ${transportCost.toLocaleString()}</span>
          </div>
        ` : ''}
        <div class="total-row">
          <span>Tax (${(taxRate * 100).toFixed(0)}% VAT)</span>
          <span>KES ${calculatedTax.toLocaleString()}</span>
        </div>
        <div class="total-row grand-total">
          <span class="grand-total-label">Total Amount</span>
          <span class="grand-total-amount">KES ${calculatedTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  `;

  // Payment Information + Notes + Terms
  const getPaymentAndNotesHTML = () => `
    <div class="payment-section" style="margin-top: ${shouldUseTwoPages ? '20px' : '30px'};">
      <div class="payment-header">
        <h4>Payment Information</h4>
      </div>
      <div class="payment-body">
        <div class="payment-method">
          <div class="payment-method-header">
            <img src="${kcbLogoUrl}" class="payment-logo" alt="KCB Bank" crossorigin="anonymous" onerror="this.style.display='none'" />
            <div>
              <div class="payment-method-title">KCB Bank Kenya</div>
              <div class="payment-method-sub">Bank Transfer</div>
            </div>
          </div>
          <div class="payment-details">
            <div class="payment-detail"><span class="payment-detail-key">Account Name</span><span class="payment-detail-value">PLASMA WATER AFRICA</span></div>
            <div class="payment-detail"><span class="payment-detail-key">Account Number</span><span class="payment-detail-value">1312281278</span></div>
            <div class="payment-detail"><span class="payment-detail-key">Branch</span><span class="payment-detail-value">Moi Avenue, Nairobi</span></div>
          </div>
        </div>
        <div class="payment-method">
          <div class="payment-method-header">
            <img src="${mpesaLogoUrl}" class="payment-logo" alt="M-PESA" crossorigin="anonymous" onerror="this.style.display='none'" />
            <div>
              <div class="payment-method-title">LIPA NA M-PESA</div>
              <div class="payment-method-sub">Till Number</div>
            </div>
          </div>
          <div class="payment-details">
            <div class="payment-detail"><span class="payment-detail-key">Lipa na M-PESA</span><span class="payment-detail-value">Buy Goods & Services</span></div>
            <div class="payment-detail"><span class="payment-detail-key">Till No.</span><span class="payment-detail-value">9114123</span></div>
            <div class="payment-detail"><span class="payment-detail-key">Account Name</span><span class="payment-detail-value">PLASMA WATER AFRICA</span></div>
          </div>
        </div>
      </div>
    </div>
    
    ${quote.notes || quote.terms ? `
      <div class="notes-terms-grid">
        ${quote.notes ? `
          <div class="notes-box">
            <div class="notes-title">Notes</div>
            <div class="notes-text">${escapeHtml(quote.notes)}</div>
          </div>
        ` : '<div class="empty-placeholder"></div>'}
        
        ${quote.terms ? `
          <div class="terms-box">
            <div class="terms-title">Terms & Conditions</div>
            <div class="terms-text">${escapeHtml(quote.terms)}</div>
          </div>
        ` : '<div class="empty-placeholder"></div>'}
      </div>
    ` : ''}
  `;

const getFooterHTML = () => `
  <div class="footer">
    <div class="footer-main">
      <div class="footer-services">
        <div class="services-list">
          <span class="service-item">Borehole Services</span>
          <span class="service-item">Water Pumps</span>
          <span class="service-item">Solar Solutions</span>
          <span class="service-item">Water Treatment</span>
          <span class="service-item">Generators</span>
          <span class="service-item">Irrigation Systems</span>
   
        </div>
      </div>
      <div class="footer-logo-section">
        <img src="${footerLogoUrl}" class="footer-logo" alt="Plasma Water Africa" crossorigin="anonymous" onerror="this.style.display='none'" />
      </div>
      <div class="footer-slogan">${escapeHtml(companySlogan)}  |  © ${new Date().getFullYear()} ${escapeHtml(companyName)}. All rights reserved.</div>
    </div>
  </div>
`;

  // Page 1 HTML
  const page1HTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet">
      <style>${getStyles()}</style>
    </head>
    <body>
      <div class="pdf-container">
        ${getHeaderHTML()}
        
        <div class="info-section">
          <div class="info-card">
            <div class="info-card-header">
              ${icons.user}
              <h3>Bill To</h3>
            </div>
            <div class="info-content">
              <div class="customer-name">${escapeHtml(customer.name)}</div>
              <div class="detail-row">    
                ${customer.email ? `
                  <div class="contact-item">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">${escapeHtml(customer.email)}</span>
                  </div>
                ` : ''}
              </div>
              <div class="detail-row">
                ${customer.phone ? `
                  <div class="contact-item">
                    <span class="detail-label">Phone</span>
                    <span class="detail-value">${escapeHtml(customer.phone)}</span>
                  </div>
                ` : ''}
              </div>
              ${customer.location ? `<div class="detail-row"><span class="detail-label">Location</span><span class="detail-value">${escapeHtml(customer.location)}</span></div>` : ''}
            </div>
          </div>

          <div class="info-card">
            <div class="info-card-header">
              ${icons.package}
              <h3>QUOTATION DETAILS</h3>
            </div>
            <div class="info-content">
              <div class="detail-row">
                <span class="detail-label">Quote Number</span>
                <span class="detail-value">${quote.quoteNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date Issued</span>
                <span class="detail-value">${new Date(quote.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Valid Until</span>
                <span class="detail-value">${new Date(quote.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
        
        ${(transportCost > 0 || transportDescription || estimatedDelivery) ? `
          <div class="transport-info">
            ${transportDescription ? `
              <div class="transport-item">
                ${icons.truck}
                <div>
                  <div class="transport-label">Delivery Method</div>
                  <div class="transport-value">${escapeHtml(transportDescription)}</div>
                </div>
              </div>
            ` : ''}
            ${transportCost > 0 ? `
              <div class="transport-item">
                <div>
                  <div class="transport-label">Delivery Cost</div>
                  <div class="transport-value">KES ${transportCost.toLocaleString()}</div>
                </div>
              </div>
            ` : ''}
            ${estimatedDelivery ? `
              <div class="transport-item">
                <div>
                  <div class="transport-label">Est. Delivery</div>
                  <div class="transport-value">${escapeHtml(estimatedDelivery)}</div>
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        ${getItemsTableHTML(page1Items)}
        
        ${showTotalsOnPage1 ? totalsBoxHTML : ''}
        
        ${!shouldUseTwoPages ? getPaymentAndNotesHTML() : ''}
        
        ${getFooterHTML()}
      </div>
    </body>
    </html>
  `;

  // Page 2 HTML
  const page2HTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet">
      <style>${getStyles()}</style>
    </head>
    <body>
      <div class="pdf-container">
        ${getHeaderHTML()}
        
        ${(transportCost > 0 || transportDescription || estimatedDelivery) ? `
          <div class="transport-info">
            ${transportDescription ? `
              <div class="transport-item">
                ${icons.truck}
                <div>
                  <div class="transport-label">Delivery Method</div>
                  <div class="transport-value">${escapeHtml(transportDescription)}</div>
                </div>
              </div>
            ` : ''}
            ${transportCost > 0 ? `
              <div class="transport-item">
                <div>
                  <div class="transport-label">Delivery Cost</div>
                  <div class="transport-value">KES ${transportCost.toLocaleString()}</div>
                </div>
              </div>
            ` : ''}
            ${estimatedDelivery ? `
              <div class="transport-item">
                <div>
                  <div class="transport-label">Est. Delivery</div>
                  <div class="transport-value">${escapeHtml(estimatedDelivery)}</div>
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        ${page2Items.length > 0 ? getItemsTableHTML(page2Items) : ''}
        
        ${showTotalsOnPage2 ? totalsBoxHTML : ''}
        
        ${shouldUseTwoPages ? getPaymentAndNotesHTML() : ''}
        
        ${getFooterHTML()}
      </div>
    </body>
    </html>
  `;

  function getStyles() {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        background: #ffffff;
        padding: 40px 45px;
        line-height: 1.5;
        color: #1a2a3a;
      }

      .pdf-container {
        max-width: 1000px;
        margin: 0 auto;
        background: white;
        position: relative;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .header {
        padding: 25px 0 20px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
      }

      .company-info {
        flex: 1;
        margin-left: 75px;
      }

      .company-name {
        font-size: 24px;
        font-weight: bold;
        letter-spacing: 1px;
        margin-bottom: 12px;
        color: #1a1a1a;
      }

      .company-address, .company-location, .company-tel, .company-email {
        font-size: 18px;
        font-weight: 500;
        color: #333;
        margin-bottom: 5px;
      }

      .logo-area {
        flex: 0 0 auto;
        margin-right: 100px;
      }

      .company-logo {
        height: 175px;
        width: auto;
        max-width: 250px;
        object-fit: contain;
        display: block;
      }

      .doc-title-section {
        width: 100%;
        margin: 35px 0 35px 0 !important;
        position: relative !important;
        display: flex !important;
        align-items: center !important;
        box-sizing: border-box;
      }

      .doc-title-section.doc-title-quotation {
        height: 22px !important; 
        background: #0b355e !important;
        width: 100% !important;
        border-top: 1px solid #ffffff !important;
        border-bottom: 1px solid #ffffff !important;
        box-shadow: 0 0 0 1px #0b355e !important;
      }

      .doc-title-container {
        width: 100% !important;
        display: flex !important;
        justify-content: flex-end !important;
        padding-right: 80px !important;
        position: absolute !important;
        z-index: 10 !important;
      }

.doc-title-text {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0px 32px 20px 32px !important;
  text-align: center !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 22px !important;
  font-weight: 800 !important;
  letter-spacing: 2px !important;
  text-transform: uppercase !important;
  background: #ffffff !important;
  line-height: 1.2 !important;
}

      .doc-title-text.text-quotation {
        color: #0b355e !important;
        border: 1.5px solid #0b355e !important;
      }
      
      .info-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        margin-bottom: 15px;
      }

      .info-card {
        padding: 0;
      }

      .info-card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 9px;
        padding-bottom: 10px;
        border-bottom: 2px solid #e9eef3;
      }

      .info-card-header h3 {
        font-size: 15px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        color: #8a9aaa;
      }

      .info-content {
        font-size: 16px;
        color: #2c3e4e;
        line-height: 1.7;
      }

      .customer-name {
        font-size: 22px;
        font-weight: 700;
        color: #0a2540;
        margin-bottom: 7px;
      }

      .detail-row {
        display: flex;
        align-items: baseline;
        gap: 12px;
        margin-bottom: 10px;
      }

      .detail-label {
        font-size: 14px;
        font-weight: 600;
        color: #8a9aaa;
        min-width: 100px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .detail-value {
        font-size: 16px;
        color: #2c3e4e;
      }

      .transport-info {
        background: #f7f9fc;
        padding: 18px 28px;
        border-radius: 16px;
        margin-bottom: 25px;
        display: none;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 20px;
        border: 1px solid #e9eef3;
      }

      .transport-item {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .transport-label {
        font-size: 14px;
        font-weight: 600;
        color: #5a7a5a;
        text-transform: uppercase;
        letter-spacing: 0.6px;
      }

      .transport-value {
        font-size: 16px;
        font-weight: 500;
        color: #2c5e3c;
      }

      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
      }

      .items-table th {
        text-align: left;
        padding: 18px 12px;
        background: #f7f9fc;
        font-size: 14px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #8a9aaa;
        border-bottom: 2px solid #e9eef3;
      }

      .items-table td {
        padding: 18px 12px;
        border-bottom: 1px solid #eef2f6;
        font-size: 16px;
        color: #2c3e4e;
        vertical-align: top;
      }

      .items-table th.text-center,
      .items-table td.text-center {
        text-align: center;
      }

      .items-table th.text-right,
      .items-table td.text-right {
        text-align: right;
      }

      .item-name {
        font-weight: 700;
        color: #0f2636;
        font-size: 18px;
        margin-bottom: 6px;
      }

      .item-description {
        font-size: 14px;
        color: #8a9aaa;
        line-height: 1.5;
        margin-top: 4px;\
        display: none;
      }

      .totals-wrapper {
        display: flex;
        justify-content: flex-end;
        margin: 5px 0 5px 0;
        padding-top: 4px;
      }

      .totals-box {
        width: 380px;
      }

      .total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        font-size: 16px;
        color: #4a5c6a;
        border-bottom: 1px solid #eef2f6;
      }

      .total-row.discount {
        color: #c75c3c;
      }

      .total-row.grand-total {
        padding-top: 16px;
        margin-top: 8px;
        border-top: 2px solid #0a2540;
        border-bottom: none;
      }

      .grand-total-label {
        font-size: 18px;
        font-weight: 700;
        color: #2d3033;
      }

      .grand-total-amount {
        font-size: 20px;
        font-weight: 800;
        color: #0a2540;
        letter-spacing: -0.5px;
      }

      .payment-section {
        margin-bottom: 10px;
        border: 1px solid #e9eef3;
        border-radius: 20px;
        overflow: hidden;
      }

      .payment-header {
        background: #0a2540;
        padding: 18px 28px;
      }

      .payment-header h4 {
        color: #ffffff;
        font-size: 15px;
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
        padding: 28px 28px;
      }

      .payment-method:first-child {
        border-right: 1px solid #e9eef3;
      }

      .payment-method-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 22px;
      }

      .payment-logo {
        height: 48px;
        width: auto;
        object-fit: contain;
      }

      .payment-method-title {
        font-size: 18px;
        font-weight: 700;
        color: #0a2540;
      }

      .payment-method-sub {
        font-size: 14px;
        color: #8a9aaa;
        margin-top: 3px;
      }

      .payment-details {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .payment-detail {
        display: flex;
        gap: 16px;
        font-size: 14px;
        flex-wrap: wrap;
      }

      .payment-detail-key {
        color: #8a9aaa;
        font-weight: 600;
        min-width: 130px;
        font-size: 14px;
        letter-spacing: 0.3px;
      }

      .payment-detail-value {
        color: #1a2a3a;
        font-weight: 800;
        font-size: 16px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      .notes-terms-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 10px;
      }

      .empty-placeholder {
        min-height: 100px;
      }

      .notes-box {
        background: #fef8e7;
        padding: 18px 24px;
        border-radius: 16px;
        margin-bottom: 0;
        border-left: 4px solid #e6a017;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .notes-title, .terms-title {
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 8px;
      }

      .notes-title {
        color: #b46f0b;
      }

      .notes-text {
        font-size: 15px;
        color: #7a5a2a;
        line-height: 1.6;
        flex: 1;
      }

      .terms-box {
        background: #f7f9fc;
        padding: 18px 24px;
        border-radius: 16px;
        margin-bottom: 0;
        border-left: 4px solid #8a9aaa;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .terms-title {
        color: #5a6e7c;
      }

      .terms-text {
        font-size: 15px;
        color: #5a6e7c;
        line-height: 1.6;
        flex: 1;
      }

      .footer {
        margin-top: 5px;
        padding: 20px 20px 25px 20px;
        border-top: 2px solid #e9eef3;
        background: white;
      }

 .footer-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-services {
  width: 100%;
  text-align: center;
  order: 1;
}

.footer-logo-section {
  text-align: center;
  order: 2;
}

.footer-logo {
  height: 55px;
  width: auto;
  object-fit: contain;
}

      .services-list {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 28px;
        margin-bottom: 15px;
      }

      .service-item {
        font-size: 15px;
        font-weight: 600;
        color: #2c5e3c;
        letter-spacing: 0.5px;
      }

      .footer-slogan {
        font-family: 'Cormorant Garamond', serif;
        font-style: italic;
        font-size: 13px;
        color: #8a9aaa;
        margin-top: 5px;
        text-align: center;
        order: 3;
      }

      @media (max-width: 768px) {
        .footer {
          padding: 15px 16px 20px 16px;
        }
        
        .footer-main {
          gap: 18px;
        }
        
        .services-list {
          gap: 16px;
        }
        
        .service-item {
          font-size: 13px;
        }
        
        .footer-logo {
          height: 42px;
        }
        
        .footer-slogan {
          font-size: 11px;
        }
      }
    `;
  }

  async function renderPage(html: string): Promise<string> {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.width = '1100px';
    container.style.backgroundColor = '#ffffff';
    container.innerHTML = html;
    document.body.appendChild(container);

    const images = container.querySelectorAll('img');
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
                setTimeout(resolve, 5000);
              }
            })
        )
      ),
      new Promise((resolve) => setTimeout(resolve, 6000)),
    ]);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = await html2canvas(container, {
      scale: 2.5,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: false,
      windowWidth: container.scrollWidth,
      windowHeight: container.scrollHeight,
    });

    document.body.removeChild(container);
    return canvas.toDataURL('image/jpeg', 0.95);
  }

  const page1Image = await renderPage(page1HTML);
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();

  const img1Props = pdf.getImageProperties(page1Image);
  const img1Height = (img1Props.height * pdfWidth) / img1Props.width;
  pdf.addImage(page1Image, 'JPEG', 0, 0, pdfWidth, img1Height);

  if (shouldUseTwoPages) {
    const page2Image = await renderPage(page2HTML);
    pdf.addPage();
    const img2Props = pdf.getImageProperties(page2Image);
    const img2Height = (img2Props.height * pdfWidth) / img2Props.width;
    pdf.addImage(page2Image, 'JPEG', 0, 0, pdfWidth, img2Height);
  }

  return pdf.output('blob');
}