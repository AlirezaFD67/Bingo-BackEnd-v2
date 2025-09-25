# API: لیست تراکنش‌های کیف پول

## اطلاعات کلی
- **Endpoint**: `GET /api/wallet/transactions`
- **احراز هویت**: JWT Bearer Token
- **گروه**: wallet
- **توضیح**: دریافت لیست تراکنش‌های کیف پول کاربر با قابلیت فیلتر

## پارامترهای ورودی (Query Parameters)

| پارامتر | نوع | اجباری | توضیح | مثال |
|---------|-----|--------|--------|------|
| type | string | خیر | نوع تراکنش | `charge`, `withdraw`, `prize` |
| status | string | خیر | وضعیت تراکنش | `pending`, `confirmed`, `failed` |
| days | number | خیر | تعداد روزهای گذشته | `3` (برای 3 روز اخیر) |

## مقادیر مجاز

### نوع تراکنش (type)
- `charge`: شارژ کیف پول
- `deposit`: واریز وجه
- `withdraw`: برداشت وجه
- `prize`: جایزه
- `referral_bonus`: پاداش معرفی
- `game_fee`: هزینه بازی
- `bingo_line`: برد خطی بازی
- `bingo_full_card`: برد کارت کامل
- `wheel_spin`: برد گردونه

### وضعیت تراکنش (status)
- `pending`: در انتظار
- `confirmed`: تأیید شده
- `failed`: ناموفق

## نمونه درخواست

```bash
GET /api/wallet/transactions?type=charge&status=confirmed&days=7
Authorization: Bearer <jwt_token>
```

## نمونه پاسخ موفق (200)

```json
[
  {
    "id": 1,
    "userId": 2,
    "amount": 100000,
    "type": "charge",
    "status": "confirmed",
    "createdAt": "2024-06-20T12:34:56.789Z",
    "description": "شارژ کیف پول"
  },
  {
    "id": 2,
    "userId": 2,
    "amount": 50000,
    "type": "referral_bonus",
    "status": "confirmed",
    "createdAt": "2024-06-20T12:35:56.789Z",
    "description": "جایزه معرفی کاربر john_doe"
  },
  {
    "id": 3,
    "userId": 2,
    "amount": -50000,
    "type": "withdraw",
    "status": "pending",
    "createdAt": "2024-06-20T12:36:56.789Z",
    "description": null
  }
]
```

## پاسخ‌های خطا

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "کاربر یافت نشد"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## نکات مهم
- تمام فیلترها اختیاری هستند
- نتایج بر اساس تاریخ ایجاد مرتب می‌شوند (جدیدترین ابتدا)
- فقط تراکنش‌های کاربر احراز هویت شده برگردانده می‌شود
- پارامتر `days` باید عدد مثبت باشد
