# سیستم رفرال و کد رفرال

## نمای کلی
سیستم رفرال این امکان را فراهم می‌کند که کاربران جدید بتوانند با استفاده از کد رفرال کاربران موجود، حساب کاربری ایجاد کنند.

## APIها

### ۱. درخواست کد OTP با کد رفرال
```
POST /api/auth/request-otp
```

**هدف**: درخواست کد OTP برای احراز هویت با امکان ارسال کد رفرال

**ورودی**:
```json
{
  "phoneNumber": "09123456789",
  "incomingReferral": "516458"
}
```

**پاسخ موفق (200)**:
```json
{
  "message": "OTP sent successfully",
  "phoneNumber": "09123456789",
  "code": "1234",
  "canUseReferral": false
}
```

**پاسخ خطا (400)**:
```json
{
  "statusCode": 400,
  "message": "Invalid referral code"
}
```

### ۲. تایید کد OTP با کد رفرال
```
POST /api/auth/verify-otp
```

**هدف**: تایید کد OTP و ایجاد حساب کاربری با کد رفرال

**ورودی**:
```json
{
  "phoneNumber": "09123456789",
  "code": "1234",
  "incomingReferral": "516458"
}
```

**پاسخ موفق (201)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "hasUsername": false
}
```

**پاسخ خطا (400)**:
```json
{
  "statusCode": 400,
  "message": "Invalid referral code"
}
```

### ۳. دریافت پروفایل کاربر
```
GET /api/users/me
```

**هدف**: دریافت اطلاعات پروفایل کاربر شامل کد رفرال

**هدر Authorization**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**پاسخ موفق (200)**:
```json
{
  "id": 10,
  "username": null,
  "firstName": null,
  "lastName": null,
  "phoneNumber": "09123456789",
  "bankCardNumber": null,
  "shebaNumber": null,
  "role": "USER",
  "createdAt": "2025-09-15T15:11:15.270Z",
  "createdAtPersian": "1404/06/26",
  "referralCode": "456789",
  "referredBy": "516458",
  "reservations": [],
  "timestamp": "2025-09-15T15:38:21.409Z",
  "duration": 3
}
```

## قوانین کسب و کار

### تولید کد رفرال
- هر کاربر جدید به صورت خودکار کد رفرال ۶ رقمی منحصر به فرد دریافت می‌کند
- کد رفرال در محدوده ۱۰۰۰۰۰ تا ۹۹۹۹۹۹ تولید می‌شود
- سیستم منحصر به فرد بودن کد را تضمین می‌کند

### اعتبارسنجی کد رفرال ورودی
- کد رفرال ورودی باید در دیتابیس وجود داشته باشد
- کد رفرال باید متعلق به کاربر دیگری باشد
- اگر کد نامعتبر باشد، خطای ۴۰۰ برگردانده می‌شود

### رفتار با کاربران موجود
- اگر شماره تلفن از قبل وجود داشته باشد، کد رفرال ورودی نادیده گرفته می‌شود
- فیلد `referredBy` کاربران موجود تغییر نمی‌کند

## فیلدهای کلیدی

| فیلد | نوع | توضیح |
|------|-----|-------|
| `referralCode` | VARCHAR(6) | کد رفرال منحصر به فرد کاربر |
| `referredBy` | VARCHAR(6) | کد رفرال کاربری که این کاربر را معرفی کرده |
| `incomingReferral` | VARCHAR(6) | کد رفرال ورودی در درخواست‌ها |

## مثال‌های استفاده

### سناریوی کاربر جدید با کد رفرال معتبر
```bash
# ۱. درخواست OTP با کد رفرال
POST /api/auth/request-otp
{
  "phoneNumber": "09111111111",
  "incomingReferral": "123456"
}

# ۲. تایید OTP
POST /api/auth/verify-otp
{
  "phoneNumber": "09111111111",
  "code": "1234",
  "incomingReferral": "123456"
}

# نتیجه: کاربر جدید با referredBy = "123456" و referralCode منحصر به فرد
```

### سناریوی کاربر جدید بدون کد رفرال
```bash
# ۱. درخواست OTP بدون کد رفرال
POST /api/auth/request-otp
{
  "phoneNumber": "09122222222"
}

# ۲. تایید OTP بدون کد رفرال
POST /api/auth/verify-otp
{
  "phoneNumber": "09122222222",
  "code": "5678"
}

# نتیجه: کاربر جدید با referralCode منحصر به فرد و referredBy = null
```

### سناریوی کاربر موجود
```bash
# حتی با ارسال کد رفرال، هیچ تغییری اعمال نمی‌شود
POST /api/auth/verify-otp
{
  "phoneNumber": "09122222222",  // کاربر موجود
  "code": "9012",
  "incomingReferral": "999999"    // نادیده گرفته می‌شود
}

# نتیجه: هیچ تغییری در referredBy کاربر اعمال نمی‌شود
```





