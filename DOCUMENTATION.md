# Customer Sales Admin API (Modern Docs)

**Base path:** ` /api/sales ` (mounted in `server/server.ts`)

This document covers the **Sales/Admin core endpoints** for managing:
- Sales customers
- Quotations (draft → sent → accepted → invoice)
- Invoices (sent → payments → auto-order creation)

> Built from: `server/routes/sales.routes.ts` + related models (`SalesCustomer`, `Quotation`, `Invoice`, `Order`, `Transaction`).

---

## 1) Auth & Roles

All endpoints below require:
- `authMiddleware`
- and **Sales/Admin access**:
  - `role === 'admin'` OR `role === 'sales'`

### Sales vs Admin access rule (ownership)
Where the code checks ownership, **sales users can only access records they created**:
- Customers: `customer.createdBy === req.user.userId`
- Quotations: `quotation.createdBy === req.user.userId`
- Invoices: `invoice.createdBy === req.user.userId`

If ownership checks fail, responses are typically `403`.

---

## 2) Common query params

Many list endpoints support:

- `search` (string): case-insensitive partial match over key fields
- `status` (string): domain-specific status filter
- `page` (string/number): default `1`
- `limit` (string/number): default `10` or `20` depending on endpoint

Some list endpoints also support:
- `sortBy`, `sortOrder`
- `startDate`, `endDate`

---

## 3) Quick API map (core)

### Customers
- `POST   /api/sales/customers`
- `GET    /api/sales/customers`
- `GET    /api/sales/customers/:id`
- `PATCH  /api/sales/customers/:id`
- `PATCH  /api/sales/customers/:id/status`
- `DELETE /api/sales/customers/:id`
- `GET    /api/sales/customers/active`
- `GET    /api/sales/customers/top`
- `GET    /api/sales/customers/stats/overview`
- Relations:
  - `GET /api/sales/customers/:id/orders`
  - `GET /api/sales/customers/:id/quotations`
  - `GET /api/sales/customers/:id/invoices`

### Quotations
- `POST   /api/sales/quotations`
- `GET    /api/sales/quotations`
- `GET    /api/sales/quotations/:id`
- `PATCH  /api/sales/quotations/:id`
- `POST   /api/sales/quotations/:id/send`
- `POST   /api/sales/quotations/:id/accept`
- `DELETE /api/sales/quotations/:id`
- `POST   /api/sales/quotations/:id/create-invoice`

### Invoices & Payments
- `GET    /api/sales/invoices`
- `GET    /api/sales/invoices/:id`
- `POST   /api/sales/invoices/:id/send`
- `POST   /api/sales/invoices/:id/payments`

### Order creation helper
- `POST /api/sales/invoices/:id/create-order`

---

## 4) Customer Sales Admin API

### Create customer
**POST** `/api/sales/customers`

**Auth:** sales/admin

**Body**
```json
{
  "name": "Acme Stores",
  "email": "buyer@acme.co.ke",
  "phone": "0712345678",
  "location": "Nairobi",
  "notes": "VIP buyer",
  "status": "active"
}
```

**Behavior / rules**
- Requires `name`
- Deduplicates by normalized `email` and/or `phone`
  - If a match exists: `409` with `{ error: 'Customer already exists', customerId }`
- Creates customer with:
  - `createdBy: req.user.userId`
  - `totalSpent: 0`

**Response**
- `201`: `{ customer }`

---

### List customers
**GET** `/api/sales/customers?search=&status=&page=&limit=`

**Query**
- `search`: matches `name|email|phone|location`
- `status`: `active|inactive`
- `page`: default `1`
- `limit`: default `20`

**Response**
```json
{
  "customers": [/*...*/],
  "pagination": {
    "current": 1,
    "limit": 20,
    "total": 123,
    "pages": 7
  }
}
```

---

### Get single customer (with stats)
**GET** `/api/sales/customers/:id`

Returns the customer plus a `stats` object including:
- `orderCount`, `quotationCount`, `invoiceCount`
- `totalRevenue` (computed from order aggregation where `paymentStatus: 'completed'`)
- `recentOrders` (latest 5)
- `recentQuotations` (latest 5)
- `recentInvoices` (latest 5)

---

### Update customer
**PATCH** `/api/sales/customers/:id`

**Body**
```json
{
  "name": "Acme Stores (Updated)",
  "email": "buyer@acme.co.ke",
  "phone": "0712345678",
  "location": "Nairobi",
  "notes": "VIP buyer",
  "status": "active"
}
```

**Rules**
- Validates `:id` as a MongoDB ObjectId
- If `role === 'sales'`, only allows updates when `createdBy` matches

**Response**
- `200`: `{ customer }`

---

### Toggle customer status
**PATCH** `/api/sales/customers/:id/status`

**Body**
```json
{ "status": "active" }
```

**Allowed values**
- `active`
- `inactive`

---

### Delete customer (hard delete)
**DELETE** `/api/sales/customers/:id`

**Rules**
- Sales can delete only their own customers
- Deletion is blocked if linked orders exist:
  - if `orderCount > 0` → `400` with `error` and `orderCount`

---

### Active customers
**GET** `/api/sales/customers/active?search=&limit=`

**Response**
- `{ customers, count }`

---

### Top customers by spending
**GET** `/api/sales/customers/top?limit=`

**Response**
- `{ customers, count }`

---

### Overview stats
**GET** `/api/sales/customers/stats/overview`

Returns:
- `totalCustomers`
- `activeCustomers`
- `inactiveCustomers`
- `totalRevenue` (sum of `totalSpent`)
- `avgCustomerValue`
- `newCustomersThisMonth`
- `growthData` for last 12 months (month+count)

---

## 5) Quotation API

### Create quotation
**POST** `/api/sales/quotations`

**Body**
```json
{
  "customerId": "<salesCustomerId>",
  "items": [
    {
      "productId": "<productId>",
      "name": "Optional override",
      "qty": 2,
      "price": 25000,
      "customPrice": true,
      "taxable": true,
      "description": "Optional item description"
    }
  ],
  "discount": 5,
  "discountType": "percentage",
  "notes": "Handle with care",
  "terms": "Due on receipt",
  "validUntil": "2026-08-01",
  "taxPerItem": true,
  "transport": {
    "cost": 1500,
    "description": "Delivery fee"
  },
  "estimatedDelivery": "2026-08-05"
}
```

**Tax rules (from code)**
- Base tax rate comes from `CompanySettings` (`taxRate`, default `0.16`)
- Exempt categories: `taxExemptCategories`
- If `taxPerItem` is enabled, tax is computed per taxable item.

**Response**
- `201`: `{ success: true, quotation: <populated> }`

---

### List quotations
**GET** `/api/sales/quotations?search=&status=&page=&limit=&sortBy=&sortOrder=&startDate=&endDate=`

**Notes**
- For `sales` role: filters `createdBy = req.user.userId`

---

### Get quotation
**GET** `/api/sales/quotations/:id`

---

### Update quotation
**PATCH** `/api/sales/quotations/:id`

Supports updates for:
- `status`, `notes`, `terms`, `validUntil`
- `discount`, `discountType`
- `taxPerItem`, `transport`, `estimatedDelivery`
- `items` (recalculates totals + tax + profit)

---

### Send quotation by email
**POST** `/api/sales/quotations/:id/send`

Rules:
- `quotation.customerEmail` must exist

On success:
- creates audit log
- notifies admins
- sets status from `draft` → `sent` when applicable

---

### Accept quotation (creates invoice)
**POST** `/api/sales/quotations/:id/accept`

Rules:
- Only allowed when `quotation.status` is `sent` or `draft`
- Validity check:
  - if expired → sets status `expired`, notifies admins, returns `400`

On accept:
- sets `quotation.status = 'accepted'`
- generates invoice number via `generateInvoiceNumber()`
- creates an `Invoice` with `status: 'sent'` and `paymentStatus: 'unpaid'`

---

### Create invoice from edited accepted quotation
**POST** `/api/sales/quotations/:id/create-invoice`

Rules:
- Only allowed when `quotation.status === 'accepted'`

---

## 6) Invoice API + Payments

### List invoices
**GET** `/api/sales/invoices?...`

Filters include:
- `status`, `paymentStatus`
- `startDate`, `endDate` (filters by `issueDate`)
- search across `invoiceNumber|quotationNumber|customerName|customerEmail`

---

### Get invoice
**GET** `/api/sales/invoices/:id`

---

### Send invoice email
**POST** `/api/sales/invoices/:id/send`

Rules:
- `invoice.customerEmail` must exist

---

### Record payment
**POST** `/api/sales/invoices/:id/payments`

**Body**
```json
{
  "amount": 50000,
  "method": "mpesa",
  "reference": "<mpesa reference or bank ref>",
  "notes": "Customer paid partial / paid in full"
}
```

**Rules**
- Validates `:id`
- `amount` must be `> 0`
- Cannot exceed `invoice.balanceDue`

**What happens on success**
1. Appends a payment record to the invoice (`invoice.payments`)
2. Updates:
   - `amountPaid`
   - `balanceDue`
   - `paymentStatus` + may update `invoice.status`
3. Creates a `Transaction`:
   - `source: 'invoice'`
   - includes `invoiceId`
   - `paymentMethod` normalized via code
4. If invoice becomes fully paid AND no `orderId` exists:
   - auto-creates an `Order` from the invoice
   - passes the payment method through

**Response shape**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "invoice": {
    "_id": "...",
    "invoiceNumber": "...",
    "paymentStatus": "paid",
    "amountPaid": 50000,
    "balanceDue": 0
  },
  "transaction": { /* created Transaction */ },
  "order": { /* created Order if fully paid */ }
}
```

---

## 7) Core flow (end-to-end)

### Customer → Quotation → Invoice → Payment → Auto-Order
1. **Create customer**
   - `POST /api/sales/customers`
2. **Create quotation**
   - `POST /api/sales/quotations` (with items)
3. **Send quotation** (optional)
   - `POST /api/sales/quotations/:id/send`
4. **Accept quotation**
   - `POST /api/sales/quotations/:id/accept`
   - creates invoice
5. **Send invoice** (optional)
   - `POST /api/sales/invoices/:id/send`
6. **Record payment(s)**
   - `POST /api/sales/invoices/:id/payments`
   - when fully paid, system auto-creates an Order from the invoice

---

## 8) Status enums (as referenced in code/models)

### Customers
- `active`
- `inactive`

### Quotations
- `draft`
- `sent`
- `accepted`
- `rejected`
- `expired`

### Invoices
Invoice `status` (model):
- `draft`
- `sent`
- `paid`
- `partially_paid`
- `overdue`
- `cancelled`

Invoice `paymentStatus`:
- `unpaid`
- `partially_paid`
- `paid`
- `overpaid`

### Orders
Order `paymentMethod`:
- `cod`, `mpesa`, `card`, `cash`, `bank_transfer`, `cheque`

Order `paymentStatus`:
- `unpaid`, `partially_paid`, `paid`, `overpaid`, `refunded`

Order `status`:
- `pending`, `processing`, `paid`, `shipped`, `delivered`, `cancelled`, `refunded`

---

## 9) Customer Checkout (Non-admin / Non-sales) + M-PESA (STK Push)

### What this section is for
Use this flow for **end customers** (users that are **not** `admin` or `sales`) placing orders and paying with **M-PESA STK Push**.

> Note: Checkout uses the **same order model** as the admin/sales flow.

---

### A) Create checkout order (supports auth + guest)
**POST** `/api/orders`

**Auth:** optional (endpoint uses `optionalAuthMiddleware`)

**Allowed users:**
- Logged-in users: any role that is **not** restricted by this endpoint (but order access checks still apply later)
- Guests (not logged in): allowed if you provide `guestInfo`

**Body (example)**
```json
{
  "items": [
    { "productId": "<productId>", "qty": 2 }
  ],
  "shippingAddress": {
    "fullName": "Jane Doe",
    "address1": "Street 1",
    "address2": "Optional",
    "city": "Nairobi",
    "state": "Nairobi",
    "zip": "00100",
    "country": "Kenya"
  },
  "shippingAreaId": "<shippingAreaId>",
  "paymentMethod": "mpesa",
  "guestInfo": {
    "email": "jane@example.com",
    "phone": "0712345678",
    "name": "Jane Doe"
  },
  "promoCode": "SAVE10",
  "notes": "Leave at reception"
}
```

**Behavior**
- Validates items and stock (reduces product stock when creating the order)
- Validates Kenyan phone format for guest checkouts
- Returns the created order including:
  - `orderNumber`, `total`, `paymentMethod`, `paymentStatus`, etc.

---

### B) Initiate M-PESA STK Push for an order
**POST** `/api/mpesa/stk-push`

**Auth:** optional (`optionalAuthMiddleware`)

**Allowed roles:**
- Non-admin / Non-sales customers: allowed
- (Admins/sales can also call it, but typical usage is customer-side)

**Body (example)**
```json
{
  "orderId": "<orderMongoId>",
  "phoneNumber": "0712345678"
}
```

**Validation & rules**
- Requires `orderId` and `phoneNumber`
- Phone number is normalized to Kenyan format
- Prevents duplicate payments while an STK push is already `pending` for the same order

**Returns**
- `checkoutRequestId` (M-PESA Checkout Request ID)
- message for user

---

### C) Track payment status (customer polling)
**GET** `/api/mpesa/payment-status/:orderId`

**Auth:** optional (`optionalAuthMiddleware`)

**Access rules**
- If the user is authenticated: they can only see the order if they own it, or if they are `admin`.
- If unauthenticated: access is allowed (public order lookup behavior).

**Response** includes:
- order payment status
- latest transaction (mpesa transactionId/status/receipt)

---

### D) M-PESA callbacks (server-to-server)
**POST** `/api/mpesa/callback`

This endpoint is used by M-PESA to notify payment results.

**Behavior**
- Idempotent: if transaction is already completed, it returns success without double-processing
- On success (`ResultCode === 0`):
  - marks the `Transaction` as `completed`
  - updates the `Order` payment fields
- On failure (`ResultCode !== 0`):
  - marks the `Transaction` as `failed`

> This endpoint is not meant to be called by customers.

---

### E) Query endpoint (STK status lookup)
**POST** `/api/mpesa/query`

**Auth:** optional (`optionalAuthMiddleware`)

**Body**
```json
{ "checkoutRequestId": "<CheckoutRequestID>" }
```

Used if you want to check STK Push status without waiting for callback.

---

## 10) Inventory API (Admin / Sales only)

All endpoints in this section require authenticated access and role checks.

### A) Inventory summary
**GET** `/api/inventory/summary`

**Auth:** required

**Allowed roles:** `admin` or `sales`

Returns:
- total stock value
- total inventory value
- total potential profit
- low/out of stock counts
- category breakdown

---

### B) Low stock report
**GET** `/api/inventory/low-stock`

**Auth:** required

**Allowed roles:** `admin` or `sales`

**Query params (examples)**
- `threshold` (default `10`)
- `category` (optional)
- `supplier` (optional)
- `notify` (`true`/`false`) - sends notifications to admins

---

### C) Restock a product
**POST** `/api/inventory/restock/:productId`

**Auth:** required

**Allowed roles:** `admin` or `sales`

**Body**
```json
{
  "quantity": 25,
  "buyingPrice": 900,
  "reason": "Restock PO #123"
}
```

**Behavior**
- increments `Product.stock`
- optionally updates buying price
- creates audit log
- notifies admins

---

### D) Export products
**GET** `/api/inventory/export`

**Auth:** required

**Allowed roles:** `admin` or `sales`

**Query params (examples)**
- `format=csv|json`
- `search`, `category`, `supplier`, `minPrice`, `maxPrice`

---

### E) Import products (CSV)
**POST** `/api/inventory/import`

**Auth:** required

**Allowed roles:** `admin` or `sales`

**Multipart form-data**
- `file`: CSV

---

### F) Bulk stock adjustment
**POST** `/api/inventory/bulk-adjust-stock`

**Auth:** required

**Allowed roles:** `admin` or `sales`

**Body**
```json
{
  "adjustments": [
    {
      "productId": "<productId>",
      "quantity": 10,
      "operation": "add"
    }
  ],
  "reason": "Correction"
}
```

---

### G) Inventory valuation
**GET** `/api/inventory/valuation`

**Auth:** required

**Allowed roles:** `admin` or `sales`

Returns:
- total retail value vs cost value
- potential profit
- top products by inventory value
- category breakdown


