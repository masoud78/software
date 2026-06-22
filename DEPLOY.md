# 📦 راهنمای Deploy روی Vercel

## مشکل اصلی
برنامه از **SQLite** (فایل محلی) استفاده می‌کرد که روی Vercel کار نمی‌کند — سرورهای Vercel فقط‌خواندنی هستند.
به **PostgreSQL** سوییچ کردیم.

---

## مراحل Deploy

### ۱. دیتابیس PostgreSQL بسازید

یکی از این سرویس‌ها رو انتخاب کنید (همگی رایگان):

**گزینه الف — Vercel Postgres (ساده‌ترین):**
1. توی داشبورد Vercel → پروژه → **Storage** tab
2. **Create Database** → **Postgres** رو انتخاب کنید
3. بعد از ساخت، روی **Connect to Project** بزنید
4. متغیر `DATABASE_URL` خودکار اضافه می‌شود

**گزینه ب — Neon (توصیه شده، رایگان و سریع):**
1. به [neon.tech](https://neon.tech) برید و ثبت‌نام کنید
2. یک پروژه جدید بسازید
3. Connection String رو کپی کنید (شکل: `postgresql://user:pass@host/db?sslmode=require`)

**گزینه ج — Supabase:**
1. به [supabase.com](https://supabase.com) برید
2. پروژه جدید → Settings → Database → Connection String (URI) رو کپی کنید

---

### ۲. متغیرهای محیطی در Vercel

توی داشبورد Vercel → پروژه → **Settings** → **Environment Variables**:

| نام | مقدار |
|-----|-------|
| `DATABASE_URL` | `postgresql://...` (از مرحله قبل) |
| `JWT_SECRET` | `content-platform-super-secret-key-2026-change-in-production` |
| `NEXT_PUBLIC_APP_NAME` | `پلتفرم مدیریت محتوا` |

---

### ۳. کد رو Push کنید

```bash
git init
git add .
git commit -m "deploy ready: PostgreSQL + Vercel"
git push
```

اگه از Vercel Git Integration استفاده می‌کنید، deploy خودکار شروع می‌شود.

---

### ۴. دیتابیس رو بسازید و Seed کنید

بعد از deploy موفق، توی **Settings → Functions** یا از طریق ترمینال:

```bash
# نصب Vercel CLI (اگه ندارید)
npm i -g vercel

# لاگین
vercel login

# لینک پروژه
vercel link

# اجرای migration روی دیتابیس تولیدی
vercel env pull .env.production.local
npx prisma db push

# اجرای seed
node prisma/seed.js
```

یا از **Vercel Console**:
```bash
npx prisma db push
node prisma/seed.js
```

---

### ۵. تست کنید

به آدرس پروژه برید و با یکی از حساب‌های تست وارد شوید:

| نقش | ایمیل | رمز |
|------|-------|-----|
| مدیر ارشد | `admin@content.ir` | `12345678` |
| مدیر محتوا | `manager@content.ir` | `12345678` |
| نویسنده | `writer@content.ir` | `12345678` |
| منتشرکننده | `publisher@content.ir` | `12345678` |

---

## ⚠️ نکات مهم

- **هر بار deploy**: `prisma generate` به‌صورت خودکار در `build` اجرا می‌شود
- **Schema تغییر کرد؟**: `npx prisma db push` رو دوباره اجرا کنید
- **JWT_SECRET**: حتماً یک مقدار تصادفی و امن برای production تنظیم کنید
- **bcryptjs**: به‌جای `bcrypt` از `bcryptjs` استفاده شده تا روی Vercel بدون مشکل کار کند