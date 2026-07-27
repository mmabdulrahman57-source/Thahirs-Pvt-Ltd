# MySQL Migration Guide — THAHIRS Backend

## Quick setup

1. Create database:
   ```sql
   CREATE DATABASE thahirs_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Update `backend/.env`:
   ```
   DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/thahirs_db"
   ```

3. Apply schema and seed:
   ```bash
   cd backend
   npm run db:push
   npm run db:seed
   ```

## What changed

- **Removed:** MongoDB / Mongoose (`mongoose`, `MONGODB_URI`, migrate scripts)
- **Added:** Prisma ORM + MySQL 8.0 (`DATABASE_URL`, `thahirs_db`)
- **Preserved:** All existing API routes and frontend compatibility (`_id` fields in JSON responses)

## Tables

`users`, `categories`, `brands`, `products`, `product_images`, `quotation_requests`, `quotation_items`, `contact_messages`, `team_members`, `gallery`, `testimonials`, `faq`, `newsletter`, `website_settings`, `activity_logs`, `projects`, `downloads`, `notifications`

## VAT

18% VAT is stored in `website_settings.settings_json.tax` and calculated in `quotationHelpers.js`.

## Backup API (admin)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/backup` | Manual JSON + SQL backup |
| GET | `/api/admin/backups` | List backup files |
| GET | `/api/admin/backup/export` | Export full JSON |
| POST | `/api/admin/backup/import` | Import JSON |
| POST | `/api/admin/backup/restore` | Restore from backup file |

Daily backup (cron):
```bash
node backend/src/seed.js --daily-backup
```

## Vercel note

Vercel serverless is not ideal for MySQL connections. Host backend on **Render**, **VPS**, or **cPanel** with MySQL. Frontend stays on Vercel.
