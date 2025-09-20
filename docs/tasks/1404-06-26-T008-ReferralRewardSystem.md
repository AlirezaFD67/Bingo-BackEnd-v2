# T008: پیاده‌سازی سیستم پاداش رفرال

## تاریخ شمسی
1404/06/26

## توضیح کلی

* **هدف تسک**: پیاده‌سازی سیستم پاداش رفرال که هنگام ثبت نام کاربر جدید با کد معرف، پاداش تعریف شده به حساب کاربر معرف اضافه شود
* **ابزارها و کتابخانه‌ها**: NestJS, TypeORM, PostgreSQL, JWT
* **قواعد و مستندهای مرتبط**: AUTH_GUIDELINES.markdown, SWAGGER_GUIDELINES.markdown, API_GUIDELINES.markdown

## رفتار دقیق تسک (Behavior)

### ۱. سیستم پاداش رفرال
- هنگام ثبت نام کاربر جدید با کد رفرال معتبر
- دریافت مبلغ پاداش از تنظیمات `app_settings.referral_reward_amount`
- بروزرسانی `walletBalance` کاربر معرف
- ایجاد تراکنش کیف پول با نوع `referral_bonus`

### ۲. منطق اعطای پاداش
- فقط برای کاربران جدید (اولین بار ثبت نام)
- فقط در صورت وجود کد رفرال معتبر
- در صورت عدم وجود تنظیمات یا مبلغ صفر، پاداش اعطا نمی‌شود
- در صورت خطا، فرایند ثبت نام متوقف نمی‌شود

### ۳. مدیریت تراکنش‌ها
- ایجاد تراکنش با نوع `REFERRAL_BONUS`
- ذخیره توضیحات شامل ID کاربر جدید
- وضعیت تراکنش `CONFIRMED`

## جداول و ارتباطات

### جدول‌های اصلی و ارتباطات:
* **جدول اصلی**: `users`, `wallet_transactions`, `app_settings`
* **ارتباط با جداول دیگر**:
  * `users.walletBalance` - موجودی کیف پول کاربر معرف
  * `wallet_transactions` - ثبت تراکنش پاداش
  * `app_settings` - دریافت مبلغ پاداش

### فیلدهای کلیدی:
* `users.walletBalance`: موجودی کیف پول کاربر
* `users.referredBy`: کد رفرال کاربر معرف
* `wallet_transactions.type`: نوع تراکنش (`referral_bonus`)
* `app_settings.key`: `referral_reward_amount`

### تغییرات دیتابیس:
* **enum جدید**: `TransactionType.REFERRAL_BONUS` در `transaction-type.enum.ts`
* **entity جدید**: `AppSettings` برای مدیریت تنظیمات
* **migration موجود**: `1700000000015-CreateAppSettingsTable.ts`

## APIها و Endpointها

### endpointهای مرتبط:

#### ۱. POST `/api/auth/verify-otp`
* **ورودی**:
  * `phoneNumber`: string
  * `code`: string
  * `incomingReferral?`: string (کد رفرال ورودی)
* **خروجی**:
  * `accessToken`: string
  * `hasUsername`: boolean
* **رفتار جدید**: اعطای پاداش رفرال در صورت ثبت نام کاربر جدید

#### ۲. PUT `/api/admin/settings/referral-reward-config`
* **ورودی**:
  * `referralRewardAmount`: number
* **خروجی**:
  * `referralRewardAmount`: number
  * `message`: string
* **هدف**: تنظیم مبلغ پاداش رفرال

## مراحل انجام (Step by Step)

### ۱. اضافه کردن نوع تراکنش جدید
- اضافه کردن `REFERRAL_BONUS` به `TransactionType` enum
- به‌روزرسانی migration موجود

### ۲. پیاده‌سازی منطق پاداش در AuthService
- اضافه کردن `WalletTransaction` و `AppSettings` به constructor
- ایجاد متد `giveReferralReward()` برای اعطای پاداش
- فراخوانی متد در `verifyOtp()` هنگام ثبت نام کاربر جدید

### ۳. به‌روزرسانی AuthModule
- اضافه کردن `WalletTransaction` و `AppSettings` به TypeOrmModule
- اطمینان از دسترسی به repository ها

### ۴. مدیریت خطاها
- استفاده از try-catch برای جلوگیری از توقف فرایند ثبت نام
- لاگ کردن خطاها برای debugging

## تست‌ها

* **مسیر فایل تست**: `src/tests/referral-reward.spec.ts`
* **سناریوهای تست**:
  * ثبت نام کاربر جدید با کد رفرال معتبر
  * بررسی بروزرسانی walletBalance کاربر معرف
  * بررسی ایجاد تراکنش referral_bonus
  * ثبت نام بدون کد رفرال (عدم اعطای پاداش)
  * ثبت نام کاربر موجود (عدم اعطای پاداش)
  * مدیریت خطا در صورت عدم وجود تنظیمات
* **پوشش تست**: ≥ 80%

## نکات تکمیلی

### محدودیت‌ها و اعتبارسنجی‌ها:
* پاداش فقط برای کاربران جدید اعطا می‌شود
* کد رفرال باید معتبر باشد
* مبلغ پاداش باید از تنظیمات خوانده شود
* در صورت خطا، فرایند ثبت نام متوقف نمی‌شود

### یادداشت‌های مهم:
* سیستم از تنظیمات `app_settings` برای دریافت مبلغ پاداش استفاده می‌کند
* تراکنش‌ها با وضعیت `CONFIRMED` ایجاد می‌شوند
* لاگ‌گیری برای debugging و monitoring

### ارجاع به مستندهای مرتبط:
* [AUTH_GUIDELINES.markdown](../AUTH_GUIDELINES.markdown)
* [SWAGGER_GUIDELINES.markdown](../SWAGGER_GUIDELINES.markdown)
* [API_GUIDELINES.markdown](../API_GUIDELINES.markdown)

## تغییرات نسبت به نسخه قبلی

* **اولین نسخه**: پیاده‌سازی کامل سیستم پاداش رفرال
* **فیلدهای اضافه شده**: `TransactionType.REFERRAL_BONUS`
* **تغییرات منطق**: اعطای پاداش در `AuthService.verifyOtp()`
* **تغییرات API**: بدون تغییر در API های موجود
* **migrationها**: استفاده از migration موجود `CreateAppSettingsTable`
