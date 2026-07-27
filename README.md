# THAHIRS (PVT) LTD - Modern Website

Premium industrial corporate website for THAHIRS (PVT) LTD, Sri Lanka's trusted industrial hardware supplier since 1949.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Three.js (React Three Fiber)
- **Backend:** Node.js, Express, MongoDB, JWT Auth, Nodemailer, PDFKit

## Quick Start

### Prerequisites
- Node.js 20+
- MySQL 8.0 (local, Hostinger, cPanel, VPS, or AWS RDS)

### Setup

```bash
# Install root dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Create MySQL database: thahirs_db
# Copy env file and set DATABASE_URL
cp backend/.env.example backend/.env

# Apply schema and seed
cd backend
npm run db:push
npm run db:seed
cd ..

# Start both frontend and backend
npm run dev
```

- **Website:** http://localhost:5173
- **API:** http://localhost:5000
- **Admin:** http://localhost:5173/admin
  - Email: `admin@thahirsgroup.com`
  - Password: `admin123`

## Deploy on Vercel

Uses standard Vercel routing (static frontend + serverless Express API):

- `frontend/dist` — React website
- `api/index.mjs` — Express backend (`/api/*`, `/uploads/*`)
- `vercel.json` — build settings and SPA rewrites

### Vercel project settings

1. Import repo on [vercel.com/new](https://vercel.com/new)
2. **Root Directory:** leave **empty** (do not use `client` or `frontend`)
3. **Framework Preset:** Other (settings come from `vercel.json`)
4. **Do NOT override** Install Command, Build Command, or Output Directory in the dashboard — `vercel.json` already sets:
   - Install: `npm install && npm install --prefix frontend && npm install --prefix backend`
   - Build: `npm run build --prefix frontend`
   - Output: `frontend/dist`
5. Add environment variables (Production):

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `mysql://user:pass@host:3306/thahirs_db` |
| `JWT_SECRET` | Strong random secret |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `FROM_EMAIL` | Outgoing email address |
| `FRONTEND_URL` | `https://your-domain.vercel.app` |

4. Deploy — Vercel builds `frontend/` and `backend/` separately.

**Note:** File uploads stored on the server disk do not persist on Vercel serverless. Use image URLs or Cloudinary for production uploads.

## Features

- Premium industrial design with 3D hero section
- Product catalogue with search and filters
- Quotation request system (no prices shown to customers)
- Admin dashboard for managing quotations
- Contact forms with email notifications
- Dark mode, live search, WhatsApp integration
- Responsive mobile-first design
- Animated counters, scroll reveals, brand slider

## Company Information Preserved

All content from the original thahirsgroup.com website has been preserved including founder history, management messages, product categories, international brand partnerships, and contact details.
