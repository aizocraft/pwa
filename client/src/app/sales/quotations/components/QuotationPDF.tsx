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

  // Logo paths
  const finalLogoUrl = logoUrl || '/logo1.png';
  const mpesaLogoUrl = '/mpesa-logo.png';
  const kcbLogoUrl = '/kcb-logo.png';
  
  const companyName = settings?.companyName || 'PLASMA WATER AFRICA';
  const companySlogan = settings?.slogan || 'Quality Water Solutions';
  const companyAddress = settings?.address || 'P.O BOX 4996-00200, NAIROBI, KENYA';
  const companyPhone = settings?.phone || '0710743793';
  const companyEmail = settings?.email || 'info@plasmawater.com';
  const taxRate = quote.taxRate || 0.16;

  // Get transport info (supports both old and new formats)
  const transportCost = quote.transportCost || quote.transportInfo?.cost || 0;
  const transportDescription = quote.transportDescription || quote.transportInfo?.description || '';
  const estimatedDelivery = quote.estimatedDelivery || quote.shippingInfo?.estimatedDelivery || '';
  const taxPerItem = quote.taxPerItem || false;

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
  };

  element.innerHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #ffffff;
          padding: 50px 45px;
          line-height: 1.5;
          color: #1a2a3a;
        }

        .pdf-container {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
        }

        /* HEADER SECTION */
        .header {
          padding: 25px 0 20px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          border-bottom: 2px solid #000;
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
          font-size: 14px;
          color: #333;
          margin-bottom: 5px;
        }

        .logo-area {
          flex: 0 0 auto;
          margin-right: 100px;
        }

        .company-logo {
          height: 225px;
          width: auto;
          max-width: 250px;
          object-fit: contain;
          display: block;
        }

        /* DOCUMENT TITLE SECTION */
        .doc-title-section {
          position: relative;
          width: 100%;
          margin: 18px 0 34px;
        }

        .doc-title-container {
          position: relative;
          z-index: 2;
          width: 100%;
          display: flex;
          justify-content: flex-end;
          padding-right: 85px;
        }

        .doc-title-text {
          position: relative;
          min-width: 240px;
          padding: 10px 42px;
          text-align: center;
          background: #efefef;
          border: 2px solid #3f6f9e;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 23px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.75), 0 1px 4px rgba(0,0,0,0.08);
        }

        .doc-title-text.quotation {
          color: #505050;
          background: #f1f1f1;
          border-color: #4b79a6;
        }

        .doc-title-text.invoice {
          color: #3d3d3d;
          background: linear-gradient(to bottom, #f8f8f8, #e7e7e7);
          border-color: #2f5f8c;
          letter-spacing: 1.5px;
        }

        /* INFO SECTION */
        .info-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 25px;
        }

        .info-card {
          padding: 0;
        }

        .info-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
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
          margin-bottom: 14px;
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

        /* Transport Info Section */
        .transport-info {
          background: #f7f9fc;
          padding: 18px 28px;
          border-radius: 16px;
          margin-bottom: 25px;
          display: flex;
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

        /* Payment Status Badges */
        .payment-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .badge-paid {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }

        .badge-unpaid {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }

        /* ITEMS TABLE */
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
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
          margin-top: 4px;
        }

        .item-tax-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #e8f4ec;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          color: #2c6e3c;
          margin-top: 6px;
        }

        .custom-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #eef2ff;
          padding: 3px 10px;
          border-radius: 14px;
          font-size: 12px;
          color: #3b5c8a;
          font-weight: 500;
          margin-top: 6px;
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
          margin-bottom: 45px;
          padding-top: 12px;
        }

        .totals-box {
          width: 380px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          font-size: 16px;
          color: #4a5c6a;
          border-bottom: 1px solid #eef2f6;
        }

        .total-row.discount {
          color: #c75c3c;
        }

        .total-row.grand-total {
          padding-top: 20px;
          margin-top: 12px;
          border-top: 2px solid #0a2540;
          border-bottom: none;
        }

        .grand-total-label {
          font-size: 20px;
          font-weight: 700;
          color: #0a2540;
        }

        .grand-total-amount {
          font-size: 28px;
          font-weight: 800;
          color: #0a2540;
          letter-spacing: -0.5px;
        }

        .tax-note {
          font-size: 11px;
          color: #6b7280;
          text-align: right;
          margin-top: 8px;
          font-style: italic;
        }

        /* PAYMENT SECTION */
        .payment-section {
          margin-bottom: 40px;
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
          gap: 12px;
        }

        .payment-detail {
          display: flex;
          gap: 16px;
          font-size: 15px;
        }

        .payment-detail-key {
          color: #8a9aaa;
          font-weight: 500;
          min-width: 110px;
        }

        .payment-detail-value {
          color: #2c3e4e;
          font-weight: 500;
          font-family: 'Inter', monospace;
          font-size: 15px;
        }

        /* NOTES & TERMS */
        .notes-box {
          background: #fef8e7;
          padding: 18px 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          border-left: 4px solid #e6a017;
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
        }

        .terms-box {
          background: #f7f9fc;
          padding: 18px 24px;
          border-radius: 16px;
          margin-bottom: 40px;
          border-left: 4px solid #8a9aaa;
        }

        .terms-title {
          color: #5a6e7c;
        }

        .terms-text {
          font-size: 15px;
          color: #5a6e7c;
          line-height: 1.6;
        }

        /* FOOTER */
        .footer {
          text-align: center;
          padding-top: 32px;
          border-top: 1px solid #e9eef3;
        }

        .footer-slogan {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 16px;
          color: #8a9aaa;
          margin-bottom: 14px;
        }

        .footer-copyright {
          font-size: 12px;
          color: #a0b0be;
          line-height: 1.7;
        }
      </style>
    </head>
    <body>
      <div class="pdf-container">
        <!-- HEADER SECTION -->
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

        <!-- Document Title -->
        <div class="doc-title-section">
          <div class="doc-title-container">
            <div class="doc-title-text ${quote.status === 'accepted' || quote.status === 'converted' ? 'invoice' : 'quotation'}">
              ${quote.status === 'accepted' || quote.status === 'converted' ? 'INVOICE' : 'QUOTATION'}
            </div>
          </div>
        </div>

        <!-- INFO SECTION -->
        <div class="info-section">
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

          <div class="info-card">
            <div class="info-card-header">
              ${icons.package}
              <h3>${quote.status === 'accepted' || quote.status === 'converted' ? 'INVOICE DETAILS' : 'QUOTATION DETAILS'}</h3>
            </div>
            <div class="info-content">
              <div class="detail-row">
                <span class="detail-label">REF Number</span>
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
              ${(quote.status === 'accepted' || quote.status === 'converted') ? `
                <div class="detail-row">
                  <span class="detail-label">Payment Status</span>
                  <span class="detail-value">
                    <span class="payment-status-badge ${quote.paymentStatus === 'paid' ? 'badge-paid' : 'badge-unpaid'}">
                      ${quote.paymentStatus === 'paid' ? '✓ PAID' : '⚠ UNPAID'}
                    </span>
                  </span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- TRANSPORT / DELIVERY INFO (New Field) -->
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

        <!-- ITEMS TABLE with Per-Item Tax Support -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 45%">Item Description</th>
              <th style="width: 10%" class="text-center">Qty</th>
              <th style="width: 20%" class="text-right">Unit Price (KES)</th>
              ${taxPerItem ? `<th style="width: 10%" class="text-center">Tax</th>` : ''}
              <th style="width: ${taxPerItem ? '15%' : '23%'}" class="text-right">Total (KES)</th>
            </tr>
          </thead>
          <tbody>
            ${quote.items.map((item: any) => {
              const itemTotal = (item.price || 0) * (item.qty || 0);
              const itemTax = item.tax || (taxPerItem ? itemTotal * taxRate : 0);
              const showTaxBadge = taxPerItem && item.taxable !== false;
              return `
              <tr>
                <td>
                  <div class="item-name">${escapeHtml(item.name)}</div>
                  ${item.description ? `<div class="item-description">${escapeHtml(item.description.substring(0, 120))}</div>` : ''}
                  ${item.customPrice ? `<div class="custom-badge">${icons.check} Custom pricing applied</div>` : ''}
                  ${showTaxBadge ? `<div class="item-tax-badge">✓ Tax: KES ${itemTax.toLocaleString()}</div>` : ''}
                  ${(!taxPerItem && item.taxable === false) ? `<div class="item-tax-badge" style="background:#fef8e7; color:#b46f0b;">No Tax</div>` : ''}
                </td>
                <td class="text-center font-mono">${item.qty}</td>
                <td class="text-right font-mono">${(item.price || 0).toLocaleString()}</td>
                ${taxPerItem ? `<td class="text-center font-mono" style="color: #2c6e3c;">${(itemTax).toLocaleString()}</td>` : ''}
                <td class="text-right font-mono" style="font-weight: 600;">${itemTotal.toLocaleString()}</td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Tax Calculation Note -->
        ${taxPerItem ? `
          <div class="tax-note">
            ✓ Tax calculated per item (${(taxRate * 100).toFixed(0)}% VAT applied to each taxable item)
          </div>
        ` : ''}

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
            ${transportCost > 0 ? `
              <div class="total-row">
                <span>Delivery</span>
                <span class="font-mono">KES ${transportCost.toLocaleString()}</span>
              </div>
            ` : ''}
            <div class="total-row">
              <span>Tax (${(taxRate * 100).toFixed(0)}% VAT${taxPerItem ? ' - per item' : ''})</span>
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
            <div class="payment-method">
              <div class="payment-method-header">
                <img src="${kcbLogoUrl}" class="payment-logo" alt="KCB Bank" crossorigin="anonymous" onerror="this.style.display='none'" />
                <div>
                  <div class="payment-method-title">KCB Bank Kenya</div>
                  <div class="payment-method-sub">Bank Transfer</div>
                </div>
              </div>
              <div class="payment-details">
                <div class="payment-detail"><span class="payment-detail-key">Account Name</span><span class="payment-detail-value">${escapeHtml(companyName)}</span></div>
                <div class="payment-detail"><span class="payment-detail-key">Account Number</span><span class="payment-detail-value">1312281278</span></div>
                <div class="payment-detail"><span class="payment-detail-key">Branch</span><span class="payment-detail-value">Moi Avenue, Nairobi</span></div>
              </div>
            </div>
            <div class="payment-method">
              <div class="payment-method-header">
                <img src="${mpesaLogoUrl}" class="payment-logo" alt="M-PESA" crossorigin="anonymous" onerror="this.style.display='none'" />
                <div>
                  <div class="payment-method-title">M-PESA</div>
                  <div class="payment-method-sub">Mobile Money</div>
                </div>
              </div>
              <div class="payment-details">
                <div class="payment-detail"><span class="payment-detail-key">Paybill Number</span><span class="payment-detail-value">9114123</span></div>
                <div class="payment-detail"><span class="payment-detail-key">Account No.</span><span class="payment-detail-value">${quote.quoteNumber}</span></div>
                <div class="payment-detail"><span class="payment-detail-key">Payment Terms</span><span class="payment-detail-value">Full payment prior to supply</span></div>
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
            This ${quote.status === 'accepted' || quote.status === 'converted' ? 'invoice' : 'quotation'} is valid until ${new Date(quote.validUntil).toLocaleDateString()}<br/>
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
              setTimeout(resolve, 5000);
            }
          })
      )
    ),
    new Promise((resolve) => setTimeout(resolve, 6000)),
  ]);

  await new Promise((resolve) => setTimeout(resolve, 300));

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