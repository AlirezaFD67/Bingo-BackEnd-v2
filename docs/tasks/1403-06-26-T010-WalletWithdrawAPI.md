# T010: پیاده‌سازی API برداشت از کیف پول

## تاریخ شمسی
1403/06/26

## توضیح کلی
پیاده‌سازی سیستم برداشت از کیف پول شامل سه API اصلی:
1. درخواست برداشت توسط کاربر
2. تایید برداشت توسط ادمین
3. رد برداشت توسط ادمین

**ابزارها و کتابخانه‌ها:** TypeORM, JWT, NestJS, class-validator, Swagger
**قواعد و مستندهای مرتبط:** API_GUIDELINES.markdown, SWAGGER_GUIDELINES.markdown

## رفتار دقیق تسک (Behavior)

### 1. درخواست برداشت توسط کاربر (`POST /api/wallet/withdraw`)
1. کاربر مبلغ برداشت را ارسال می‌کند
2. سیستم موجودی کیف پول کاربر را بررسی می‌کند
3. اگر موجودی کافی باشد:
   - تراکنش جدید با نوع `withdraw` و وضعیت `pending` ایجاد می‌شود
   - مبلغ از `walletBalance` کاربر کم می‌شود
   - تراکنش با مبلغ منفی ذخیره می‌شود
4. اگر موجودی کافی نباشد، خطای `BadRequestException` ارسال می‌شود

### 2. تایید برداشت توسط ادمین (`POST /api/admin/wallet/withdraw/confirm/{txId}`)
1. ادمین شناسه تراکنش را ارسال می‌کند
2. سیستم تراکنش را پیدا می‌کند
3. بررسی می‌کند که تراکنش از نوع `withdraw` و وضعیت `pending` باشد
4. وضعیت تراکنش به `confirmed` تغییر می‌یابد
5. مبلغ از کیف پول کاربر کم شده باقی می‌ماند

### 3. رد برداشت توسط ادمین (`POST /api/admin/wallet/withdraw/reject/{txId}`)
1. ادمین شناسه تراکنش را ارسال می‌کند
2. سیستم تراکنش را پیدا می‌کند
3. بررسی می‌کند که تراکنش از نوع `withdraw` و وضعیت `pending` باشد
4. وضعیت تراکنش به `failed` تغییر می‌یابد
5. مبلغ به `walletBalance` کاربر بازگردانده می‌شود

## جداول و ارتباطات

### جدول اصلی: `wallet_transactions`
- **فیلدهای کلیدی:**
  - `id`: شناسه تراکنش (integer, auto-increment)
  - `userId`: شناسه کاربر (integer, foreign key)
  - `amount`: مبلغ تراکنش (bigint) - برای برداشت منفی است
  - `type`: نوع تراکنش (enum) - `withdraw` برای برداشت
  - `status`: وضعیت تراکنش (enum) - `pending`, `confirmed`, `failed`
  - `description`: توضیحات تراکنش (varchar, nullable)
  - `createdAt`: تاریخ ایجاد (timestamp)

### جدول مرتبط: `users`
- **فیلد کلیدی:**
  - `walletBalance`: موجودی کیف پول (bigint) - در زمان برداشت کم می‌شود

### ارتباطات:
- `wallet_transactions.userId` → `users.id` (Foreign Key, CASCADE)

## APIها و Endpointها

### 1. درخواست برداشت
- **روش:** POST
- **مسیر:** `/api/wallet/withdraw`
- **ورودی:** `WithdrawWalletDto`
  - `amount`: number (مبلغ برداشت)
- **خروجی:** `WithdrawWalletResponseDto`
  - `id`: number
  - `userId`: number
  - `amount`: number (منفی)
  - `type`: string (`withdraw`)
  - `status`: string (`pending`)
  - `createdAt`: Date

### 2. تایید برداشت
- **روش:** POST
- **مسیر:** `/api/admin/wallet/withdraw/confirm/{txId}`
- **ورودی:** `txId` (path parameter)
- **خروجی:** `WithdrawWalletResponseDto` با `status: confirmed`

### 3. رد برداشت
- **روش:** POST
- **مسیر:** `/api/admin/wallet/withdraw/reject/{txId}`
- **ورودی:** `txId` (path parameter)
- **خروجی:** `WithdrawWalletResponseDto` با `status: failed`

## مراحل انجام (Step by Step)

1. **ایجاد DTOها:**
   - `WithdrawWalletDto`: برای درخواست برداشت
   - `WithdrawWalletResponseDto`: برای پاسخ API

2. **پیاده‌سازی WalletService:**
   - متد `withdrawWallet`: منطق اصلی برداشت
   - استفاده از QueryRunner برای transaction management

3. **پیاده‌سازی WalletController:**
   - endpoint `POST /api/wallet/withdraw`
   - اعمال JWT Guard و validation

4. **پیاده‌سازی AdminWalletService:**
   - متد `confirmWithdraw`: تایید برداشت
   - متد `rejectWithdraw`: رد برداشت و بازگشت مبلغ

5. **پیاده‌سازی AdminWalletController:**
   - endpoint `POST /api/admin/wallet/withdraw/confirm/{txId}`
   - endpoint `POST /api/admin/wallet/withdraw/reject/{txId}`
   - اعمال Role-based access control

6. **مستندسازی Swagger:**
   - تعریف API responses و error codes
   - مستندسازی کامل endpointها

## تست‌ها
- **مسیر فایل تست:** `src/tests/wallet-withdraw.spec.ts`
- **سناریوهای تست:**
  - برداشت موفق با موجودی کافی
  - خطای موجودی ناکافی
  - تایید برداشت توسط ادمین
  - رد برداشت و بازگشت مبلغ
  - بررسی transaction integrity
- **پوشش تست:** ≥ 80%

## نکات تکمیلی
- **Transaction Management:** استفاده از QueryRunner برای اطمینان از یکپارچگی داده‌ها
- **Validation:** بررسی موجودی کافی قبل از برداشت
- **Error Handling:** مدیریت خطاها با پیام‌های مناسب فارسی
- **Authorization:** استفاده از JWT Guard و Role-based access برای ادمین
- **Type Safety:** استفاده از TypeScript و DTO ها برای type safety

## تغییرات نسبت به نسخه قبلی
- **فایل‌های جدید:**
  - `src/modules/wallet/dto/withdraw-wallet.dto.ts`
  - `src/modules/wallet/dto/withdraw-wallet-response.dto.ts`
- **فایل‌های تغییر یافته:**
  - `src/modules/wallet/wallet.service.ts`: اضافه شدن متد `withdrawWallet`
  - `src/modules/wallet/wallet.controller.ts`: اضافه شدن endpoint برداشت
  - `src/modules/admin/wallet.service.ts`: اضافه شدن متدهای `confirmWithdraw` و `rejectWithdraw`
  - `src/modules/admin/wallet.controller.ts`: اضافه شدن endpointهای ادمین
