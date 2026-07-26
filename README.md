# THAHIRS (PVT) LTD - Modern Website

Premium industrial corporate website for THAHIRS (PVT) LTD, Sri Lanka's trusted industrial hardware supplier since 1949.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Three.js (React Three Fiber)
- **Backend:** Node.js, Express, MongoDB, JWT Auth, Nodemailer, PDFKit

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local fallback via `data/db.json`)

### Setup

```bash
# Install root dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Copy env file and add your MongoDB URI
cp backend/.env.example backend/.env

# Start both frontend and backend
npm run dev
```

- **Website:** http://localhost:5173
- **API:** http://localhost:5000
- **Admin:** http://localhost:5173/admin
  - Email: `admin@thahirsgroup.com`
  - Password: `admin123`

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
