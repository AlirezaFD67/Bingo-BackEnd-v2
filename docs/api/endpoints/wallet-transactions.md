# API تراکنش‌های کیف پول کاربران

## نمای کلی
این API امکان دریافت لیست تراکنش‌های کیف پول کاربران را با قابلیت فیلتر و pagination فراهم می‌کند.

## APIها

### ۱. دریافت لیست تراکنش‌های کیف پول
```
GET /api/wallet/transactions
```

**هدف**: دریافت لیست تراکنش‌های کیف پول کاربر با قابلیت فیلتر و pagination

**هدر Authorization**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Query Parameters**:
| پارامتر | نوع | اجباری | پیش‌فرض | توضیح |
|---------|-----|--------|---------|-------|
| `type` | string | خیر | - | نوع تراکنش (`charge`, `withdraw`, `prize`, `referral_bonus`, `game_fee`, `card_purchase`, `bingo_line`, `bingo_full_card`, `wheel_spin`) |
| `status` | string | خیر | - | وضعیت تراکنش (`pending`, `confirmed`, `failed`) |
| `days` | number | خیر | - | تعداد روزهای گذشته برای فیلتر (حداقل 1) |
| `page` | number | خیر | 1 | شماره صفحه برای pagination (حداقل 1) |
| `limit` | number | خیر | 20 | تعداد آیتم در هر صفحه (1-100) |

**مثال درخواست**:
```
GET /api/wallet/transactions?page=1&limit=20&type=charge&days=7
```

**پاسخ موفق (200)**:
```json
[
  {
    "id": 1,
    "userId": 123,
    "amount": 100000,
    "type": "charge",
    "status": "confirmed",
    "createdAt": "2025-09-27T21:04:14.000Z",
    "description": "شارژ کیف پول"
  },
  {
    "id": 2,
    "userId": 123,
    "amount": 50000,
    "type": "card_purchase",
    "status": "confirmed",
    "createdAt": "2025-09-27T20:30:00.000Z",
    "description": "خرید کارت برای روم 11"
  },
  {
    "id": 3,
    "userId": 123,
    "amount": 25000,
    "type": "bingo_line",
    "status": "confirmed",
    "createdAt": "2025-09-27T19:15:30.000Z",
    "description": "برد خطی بازی"
  },
  {
    "id": 4,
    "userId": 123,
    "amount": 5000,
    "type": "referral_bonus",
    "status": "confirmed",
    "createdAt": "2025-09-27T18:45:12.000Z",
    "description": "پاداش رفرال"
  },
  {
    "id": 5,
    "userId": 123,
    "amount": 10000,
    "type": "wheel_spin",
    "status": "confirmed",
    "createdAt": "2025-09-27T17:20:45.000Z",
    "description": "برد گردونه"
  }
]
```

**پاسخ خطا (401)**:
```json
{
  "statusCode": 401,
  "timestamp": "2025-09-27T21:04:14.000Z",
  "path": "/api/wallet/transactions",
  "method": "GET",
  "message": "Invalid or missing JWT token"
}
```

**پاسخ خطا (404)**:
```json
{
  "statusCode": 404,
  "timestamp": "2025-09-27T21:04:14.000Z",
  "path": "/api/wallet/transactions",
  "method": "GET",
  "message": "کاربر یافت نشد"
}
```

## انواع تراکنش‌ها

| نوع | توضیح | مبلغ | توضیحات |
|-----|-------|------|---------|
| `charge` | شارژ کیف پول | مثبت | افزایش موجودی توسط کاربر |
| `withdraw` | درخواست برداشت | منفی | کاهش موجودی برای برداشت |
| `prize` | جایزه | مثبت | جایزه نقدی |
| `referral_bonus` | پاداش رفرال | مثبت | پاداش معرفی کاربر جدید |
| `game_fee` | هزینه بازی (کلی) | منفی | هزینه کلی بازی |
| `card_purchase` | خرید کارت | منفی | خرید کارت برای ورود به روم |
| `bingo_line` | برد خطی بازی | مثبت | جایزه برد خطی در بازی |
| `bingo_full_card` | برد کارت کامل | مثبت | جایزه برد کارت کامل |
| `wheel_spin` | برد گردونه | مثبت | جایزه چرخاندن گردونه |

## وضعیت‌های تراکنش

| وضعیت | توضیح |
|-------|-------|
| `pending` | در انتظار تایید |
| `confirmed` | تایید شده |
| `failed` | ناموفق |

## قوانین کسب و کار

### Pagination
- هر صفحه حداکثر 100 آیتم می‌تواند داشته باشد
- شماره صفحه از 1 شروع می‌شود
- در صورت عدم ارسال `page` و `limit`، مقادیر پیش‌فرض (1 و 20) استفاده می‌شود

### فیلترها
- فیلتر `type` فقط انواع معتبر تراکنش را می‌پذیرد (لیست کامل در جدول بالا)
- فیلتر `status` فقط وضعیت‌های معتبر را می‌پذیرد (`pending`, `confirmed`, `failed`)
- فیلتر `days` فقط اعداد مثبت می‌پذیرد
- امکان فیلتر چندگانه `type` با کاما (مثل `type=bingo_line,bingo_full_card`)

### دسته‌بندی تراکنش‌ها
- **تراکنش‌های مثبت**: `charge`, `prize`, `referral_bonus`, `bingo_line`, `bingo_full_card`, `wheel_spin`
- **تراکنش‌های منفی**: `withdraw`, `game_fee`, `card_purchase`

### امنیت
- فقط کاربر احراز هویت شده می‌تواند تراکنش‌های خود را مشاهده کند
- JWT token معتبر در header الزامی است

## مثال‌های استفاده

### دریافت تمام تراکنش‌ها
```bash
GET /api/wallet/transactions
Authorization: Bearer <jwt_token>
```

### دریافت تراکنش‌های شارژ
```bash
GET /api/wallet/transactions?type=charge
Authorization: Bearer <jwt_token>
```

### دریافت تراکنش‌های 7 روز اخیر
```bash
GET /api/wallet/transactions?days=7
Authorization: Bearer <jwt_token>
```

### دریافت صفحه دوم با 10 آیتم
```bash
GET /api/wallet/transactions?page=2&limit=10
Authorization: Bearer <jwt_token>
```

### دریافت تراکنش‌های جایزه
```bash
GET /api/wallet/transactions?type=prize
Authorization: Bearer <jwt_token>
```

### دریافت تراکنش‌های برد بازی
```bash
GET /api/wallet/transactions?type=bingo_line,bingo_full_card
Authorization: Bearer <jwt_token>
```

### دریافت تراکنش‌های گردونه
```bash
GET /api/wallet/transactions?type=wheel_spin
Authorization: Bearer <jwt_token>
```

### دریافت تراکنش‌های ناموفق
```bash
GET /api/wallet/transactions?status=failed
Authorization: Bearer <jwt_token>
```

### ترکیب فیلترها
```bash
GET /api/wallet/transactions?type=card_purchase&status=confirmed&days=30&page=1&limit=5
Authorization: Bearer <jwt_token>
```