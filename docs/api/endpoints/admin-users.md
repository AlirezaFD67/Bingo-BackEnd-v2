# APIهای مدیریت کاربران (Admin)

## نمای کلی
این مجموعه APIها امکان مدیریت کاربران توسط ادمین‌ها را فراهم می‌کند. تمامی endpointها نیاز به توکن JWT معتبر و نقش ADMIN دارند.

## APIها

### ۱. دریافت لیست همه کاربران
```
GET /api/admin/users
```

**هدف**: دریافت لیست کامل کاربران سیستم توسط ادمین‌ها

**هدر Authorization**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**پاسخ موفق (200)**:
```json
[
  {
    "id": 1,
    "username": "john_doe",
    "firstName": "علی",
    "lastName": "احمدی",
    "phoneNumber": "09123456789",
    "bankCardNumber": "1234567890123456",
    "shebaNumber": "IR123456789012345678901234",
    "referralCode": "12345",
    "referredBy": "67890",
    "role": "USER",
    "walletBalance": 500000,
    "createdAt": "2024-06-20T12:34:56.789Z",
    "createdAtPersian": "1403/03/31"
  }
]
```

**پاسخ خطا (401)**:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### ۲. دریافت کاربر بر اساس ID
```
GET /api/admin/users/{id}
```

**هدف**: دریافت اطلاعات کامل کاربر مشخص بر اساس ID توسط ادمین‌ها

**هدر Authorization**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**پارامترهای مسیر**:
- `id`: number (شناسه کاربر)

**پاسخ موفق (200)**:
```json
{
  "id": 1,
  "username": "john_doe",
  "firstName": "علی",
  "lastName": "احمدی",
  "phoneNumber": "09123456789",
  "bankCardNumber": "1234567890123456",
  "shebaNumber": "IR123456789012345678901234",
  "referralCode": "12345",
  "referredBy": "67890",
  "role": "USER",
  "walletBalance": 500000,
  "createdAt": "2024-06-20T12:34:56.789Z",
  "createdAtPersian": "1403/03/31"
}
```

**پاسخ خطا (401)**:
```json
{
  "statusCode": 401,
  "message": "توکن معتبر نیست یا کاربر ادمین نیست"
}
```

**پاسخ خطا (404)**:
```json
{
  "statusCode": 404,
  "message": "کاربر یافت نشد"
}
```

## قوانین امنیتی

### احراز هویت
- تمامی درخواست‌ها باید شامل هدر `Authorization` با فرمت `Bearer {token}` باشند
- توکن باید معتبر و منقضی نشده باشد

### مجوزدهی (Authorization)
- کاربر باید نقش `ADMIN` داشته باشد
- کاربران با نقش `USER` نمی‌توانند به این endpointها دسترسی داشته باشند

### اعتبارسنجی داده‌ها
- پارامتر `id` باید عدد صحیح مثبت باشد
- اگر کاربر با ID مشخص یافت نشد، خطای 404 برگردانده می‌شود

## فیلدهای کلیدی

| فیلد | نوع | توضیح | الزامی |
|------|-----|-------|--------|
| `id` | number | شناسه منحصر به فرد کاربر | بله |
| `username` | string | نام کاربری | خیر |
| `firstName` | string | نام | خیر |
| `lastName` | string | نام خانوادگی | خیر |
| `phoneNumber` | string | شماره تلفن | بله |
| `bankCardNumber` | string | شماره کارت بانکی (بدون space) | خیر |
| `shebaNumber` | string(26) | شماره شبا | خیر |
| `referralCode` | string(6) | کد معرف | خیر |
| `referredBy` | string(6) | کد معرف کننده | خیر |
| `role` | enum | نقش کاربر (USER/ADMIN) | بله |
| `walletBalance` | number | موجودی کیف پول (به ریال) | بله |
| `createdAt` | Date | تاریخ ایجاد (ISO string) | بله |
| `createdAtPersian` | string | تاریخ ایجاد (شمسی) | بله |

## مثال‌های استفاده

### دریافت لیست کاربران
```bash
GET /api/admin/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### دریافت کاربر خاص
```bash
GET /api/admin/users/123
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### خطای دسترسی غیرمجاز
```bash
GET /api/admin/users/123
Authorization: Bearer eyJhbGciOiJIUzI1NiIs... # توکن کاربر عادی
```
```json
{
  "statusCode": 401,
  "message": "توکن معتبر نیست یا کاربر ادمین نیست"
}
```

### خطای کاربر یافت نشد
```bash
GET /api/admin/users/9999
Authorization: Bearer eyJhbGciOiJIUzI1NiIs... # توکن ادمین معتبر
```
```json
{
  "statusCode": 404,
  "message": "کاربر یافت نشد"
}
```

## نکات مهم

- **امنیت**: این APIها فقط برای ادمین‌ها قابل دسترسی هستند
- **کارایی**: endpoint لیست کاربران ممکن است برای سیستم‌های بزرگ کند باشد
- **داده‌ها**: اطلاعات حساس (رمز عبور و غیره) در پاسخ شامل نمی‌شوند
- **فرمت تاریخ**: `createdAtPersian` با استفاده از تقویم شمسی محاسبه می‌شود
- **فرمت کارت بانکی**: spaceها به صورت خودکار حذف می‌شوند
