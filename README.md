# Plasma Water Africa (PSMA)

This repository contains multiple apps/services:

- `front/` — Vite + React + TypeScript application (Tailwind/shadcn-ui).
- `server/` — Express + TypeScript backend (API, auth, payments, notifications, etc.).
- `client/` — Next.js application/config (appears to be a separate frontend variant).

---

## Quick start (recommended)

Because this repo is multi-project, use the app you want to run:

### front/ (Vite)

```bash
cd front
npm i
npm run dev
```

### server/ (Express)

```bash
cd server
npm i
npm run dev
```

### client/ (Next.js)

```bash
cd client
npm i
npm run dev
```

---

## Docs

- Main documentation: [`DOCUMENTATION.md`](./DOCUMENTATION.md)

### Sales Admin API (core)

The backend exposes sales/customer/admin endpoints under the base path:

- `/api/sales`

Sales customer + quotation + invoice + payment endpoints are documented in: `DOCUMENTATION.md` → **Customer Sales Admin API (Modern Docs)**.

---

## Repo structure

### front/
- `src/` — React application source.
- `vite.config.ts` — Vite build/dev settings.
- `tailwind.config.ts` — Tailwind CSS configuration.

### server/
- `server.ts` — Express entrypoint.
- `routes/` — Route modules (auth, products, orders, payments, etc.).
- `middleware/` — Cross-cutting middleware (auth, audit logging, image compression, etc.).
- `models/` — Mongoose models.
- `services/` — Email/notification/payment/PDF services.
- `utils/` — Helper utilities.

---

## Environment variables

This repo uses environment variables (see `server/.env` usage patterns and `dotenv`).

Create a `.env` file for each service that requires it.

### server/
Expected to include things like:
- Database connection string (MongoDB / Mongoose)
- Session/secret keys (JWT/passport)
- Stripe keys
- Email provider keys
- OAuth client secrets

(Exact variable names should be read from code: `server/config/*` and `server/middleware/*`.)

---

## Next steps to improve documentation

- Add `API.md` with route-by-route summaries from `server/routes/*`.
- Add `SETUP.md` with exact `.env` keys by reading `server/config/*`.
- Add `ARCHITECTURE.md` with diagrams (auth flow, order/payment flow, etc.).

