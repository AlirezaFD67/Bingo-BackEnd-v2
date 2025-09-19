# WheelSpin: پیاده‌سازی سیستم چرخش گردونه

## تاریخ شمسی
1403/06/28

## توضیح کلی
پیاده‌سازی سیستم چرخش گردونه که به کاربران امکان دریافت جایزه از طریق چرخش گردونه را می‌دهد. هر کاربر فقط یکبار در 24 ساعت می‌تواند گردونه بچرخاند. سیستم شامل محدودیت زمانی، اعتبارسنجی مقادیر جایزه، بروزرسانی کیف پول و ثبت تراکنش‌ها می‌باشد.

**ابزارها و کتابخانه‌ها:** NestJS, TypeORM, JWT, class-validator, Swagger

**مستندهای مرتبط:** API_GUIDELINES.markdown, AUTH_GUIDELINES.markdown, CODING_GUIDELINES.markdown

## رفتار دقیق تسک (Behavior)

### 1. بررسی مجاز بودن چرخش (`/api/wheel/can-spin`)
1. دریافت اطلاعات کاربر از JWT token
2. جستجوی آخرین چرخش کاربر در جدول `wheel_spins`
3. اگر چرخشی وجود نداشت → `canSpin: true`
4. اگر چرخش وجود داشت:
   - محاسبه زمان سپری شده از آخرین چرخش
   - اگر 24 ساعت گذشته → `canSpin: true`
   - اگر کمتر از 24 ساعت → `canSpin: false` + محاسبه `remainingTime`

### 2. چرخش گردونه (`/api/wheel/spin`)
1. اعتبارسنجی مقدار ورودی (فقط 20000, 10000, 5000, 0)
2. بررسی محدودیت 24 ساعته
3. ذخیره چرخش در جدول `wheel_spins`:
   - `userId`: شناسه کاربر
   - `prizeAmount`: مقدار جایزه
   - `lastSpinAt`: زمان فعلی
4. اگر `prizeAmount > 0`:
   - بروزرسانی `walletBalance` کاربر
   - ثبت تراکنش در `wallet_transactions` با نوع `WHEEL_SPIN`
5. برگرداندن نتیجه شامل موجودی جدید

## جداول و ارتباطات

### جداول اصلی:
- **`wheel_spins`**: ثبت چرخش‌های گردونه
  - `id`: شناسه یکتا (Primary Key)
  - `userId`: شناسه کاربر (Foreign Key → `users.id`)
  - `prizeAmount`: مقدار جایزه (integer)
  - `lastSpinAt`: زمان آخرین چرخش (timestamp)
  - `createdAt`: زمان ایجاد (auto-generated)
  - `updatedAt`: زمان بروزرسانی (auto-generated)

- **`wallet_transactions`**: ثبت تراکنش‌های کیف پول
  - `id`: شناسه یکتا (Primary Key)
  - `userId`: شناسه کاربر (Foreign Key → `users.id`)
  - `amount`: مقدار تراکنش (bigint)
  - `type`: نوع تراکنش (enum: WHEEL_SPIN)
  - `status`: وضعیت تراکنش (enum: confirmed)
  - `description`: توضیحات تراکنش
  - `createdAt`: زمان ایجاد (auto-generated)

- **`users`**: بروزرسانی موجودی کیف پول
  - `walletBalance`: موجودی کیف پول (bigint)

### ارتباطات:
- `wheel_spins.userId` → `users.id` (CASCADE DELETE)
- `wallet_transactions.userId` → `users.id` (CASCADE DELETE)

## API ها و Endpoint ها

### GET `/api/wheel/can-spin`
**ورودی:** 
- Headers: `Authorization: Bearer <JWT_TOKEN>`

**خروجی:**
```json
{
  "canSpin": boolean,
  "remainingTime": "hh:mm" // اختیاری، فقط اگر canSpin = false
}
```

### POST `/api/wheel/spin`
**ورودی:**
```json
{
  "value": 20000 // فقط مقادیر مجاز: 20000, 10000, 5000, 0
}
```

**خروجی:**
```json
{
  "success": true,
  "prizeAmount": 20000,
  "newBalance": 150000,
  "message": "جایزه گردونه با موفقیت ثبت شد"
}
```

## مراحل انجام (Step by Step)

1. **ایجاد Entity ها:**
   - `WheelSpin` entity با فیلدهای مورد نیاز
   - `WalletTransaction` entity برای ثبت تراکنش‌ها

2. **ایجاد Enum ها:**
   - `TransactionType` شامل انواع تراکنش‌ها
   - `TransactionStatus` شامل وضعیت‌های تراکنش

3. **ایجاد DTO ها:**
   - `SpinWheelDto`: اعتبارسنجی ورودی چرخش
   - `SpinWheelResponseDto`: فرمت پاسخ چرخش
   - `CanSpinResponseDto`: فرمت پاسخ بررسی مجاز بودن

4. **ایجاد سرویس:**
   - `WheelService` با منطق چرخش و بررسی محدودیت‌ها

5. **ایجاد کنترلر:**
   - `WheelController` با دو endpoint اصلی

6. **ایجاد ماژول:**
   - `WheelModule` با تنظیمات TypeORM و JWT

7. **بروزرسانی AppModule:**
   - اضافه کردن `WheelModule` به imports

## تست‌ها
**مسیر فایل تست:** `src/tests/wheel.service.spec.ts`

**سناریوهای تست:**
- تست بررسی مجاز بودن چرخش برای کاربر جدید
- تست بررسی مجاز بودن چرخش با محدودیت زمانی
- تست چرخش گردونه با جایزه مثبت
- تست چرخش گردونه بدون جایزه
- تست اعتبارسنجی مقادیر نامعتبر
- تست محدودیت 24 ساعته

**پوشش تست:** ≥ 80%

## نکات تکمیلی

### محدودیت‌ها و اعتبارسنجی‌ها:
- هر کاربر فقط یکبار در 24 ساعت می‌تواند گردونه بچرخاند
- فقط مقادیر 20000, 10000, 5000, 0 تومان قابل قبول است
- تمام API ها نیاز به JWT authentication دارند

### یادداشت‌های مهم:
- اگر جایزه صفر باشد، فقط زمان چرخش ثبت می‌شود و تراکنشی ایجاد نمی‌شود
- زمان محدودیت از آخرین چرخش محاسبه می‌شود (نه از شروع روز)
- تراکنش‌ها با وضعیت `confirmed` ثبت می‌شوند

### ارجاع به مستندهای مرتبط:
- [API_GUIDELINES.markdown](../api/API_GUIDELINES.markdown)
- [AUTH_GUIDELINES.markdown](../api/AUTH_GUIDELINES.markdown)
- [CODING_GUIDELINES.markdown](../CODING_GUIDELINES.markdown)
