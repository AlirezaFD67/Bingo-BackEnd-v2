# T001: پیاده‌سازی سیستم رفرال و کد رفرال

## تاریخ شمسی
1404/06/26

## توضیح کلی

* **هدف تسک**: پیاده‌سازی سیستم کد رفرال ۶ رقمی منحصر به فرد برای کاربران جدید و اعتبارسنجی کدهای رفرال ورودی
* **ابزارها و کتابخانه‌ها**: NestJS, TypeORM, PostgreSQL, JWT
* **قواعد و مستندهای مرتبط**: AUTH_GUIDELINES.markdown, SWAGGER_GUIDELINES.markdown, API_GUIDELINES.markdown

## رفتار دقیق تسک (Behavior)

### ۱. تولید کد رفرال منحصر به فرد
- تولید کد ۶ رقمی تصادفی (۱۰۰۰۰۰ تا ۹۹۹۹۹۹)
- بررسی منحصر به فرد بودن در جدول `users.referralCode`
- در صورت تکراری بودن، تولید کد جدید تا ۱۰ بار تلاش
- اگر موفق نشد، ترکیب با timestamp و تولید کد جدید

### ۲. اعتبارسنجی کد رفرال ورودی
- بررسی وجود کد رفرال در جدول `users.referralCode`
- اگر کد معتبر باشد، اجازه ادامه فرایند
- اگر کد نامعتبر باشد، خطای `Invalid referral code` برگردانده شود

### ۳. ایجاد کاربر جدید با کد رفرال
- اگر کاربر جدید باشد (`!user`)، کد رفرال منحصر به فرد تولید شود
- مقدار `referredBy` از `incomingReferral` (در صورتی که معتبر باشد) تنظیم شود
- کد رفرال در فیلد `referralCode` ذخیره شود

### ۴. منطق کاربران موجود
- اگر کاربر از قبل وجود داشته باشد، هیچ تغییری در `referredBy` اعمال نشود
- فرایند لاگین عادی ادامه پیدا کند

## جداول و ارتباطات

### جدول‌های اصلی و ارتباطات:
* **جدول اصلی**: `users`
* **ارتباط با جداول دیگر**:
  * `otp_codes` برای ذخیره `incomingReferral` موقت
  * ارتباط با جدول `users` برای اعتبارسنجی کدهای رفرال

### فیلدهای کلیدی:
* `users.referralCode`: VARCHAR(6) UNIQUE - کد رفرال منحصر به فرد کاربر
* `users.referredBy`: VARCHAR(6) - کد رفرال کاربری که این کاربر را معرفی کرده
* `otp_codes.incomingReferral`: VARCHAR(6) - کد رفرال ورودی موقت

### تغییرات دیتابیس:
* **migration لازم**: `1700000000001-CreateUserTable.ts`
  * تغییر طول `referralCode` از VARCHAR(5) به VARCHAR(6)
  * تغییر طول `referredBy` از VARCHAR(5) به VARCHAR(6)
* **migration لازم**: `1700000000007-CreateOtpCodesTable.ts`
  * اضافه کردن طول VARCHAR(6) برای `incomingReferral`

## APIها و Endpointها

### endpointهای مرتبط:

#### ۱. POST `/api/auth/request-otp`
* **ورودی**:
  * `phoneNumber`: string (شماره تلفن)
  * `incomingReferral?`: string (کد رفرال ورودی - اختیاری)
* **خروجی**:
  * `message`: string
  * `phoneNumber`: string
  * `code`: string (فقط در محیط development)
  * `canUseReferral`: boolean

#### ۲. POST `/api/auth/verify-otp`
* **ورودی**:
  * `phoneNumber`: string
  * `code`: string
  * `incomingReferral?`: string
* **خروجی**:
  * `accessToken`: string
  * `hasUsername`: boolean

#### ۳. GET `/api/users/me`
* **ورودی**: Authorization header با Bearer token
* **خروجی**:
  * اطلاعات کامل کاربر شامل `referralCode`

## مراحل انجام (Step by Step)

### ۱. ایجاد سیستم تولید کد رفرال
- متد `generateUniqueReferralCode()` در `AuthService`
- تولید کد ۶ رقمی تصادفی
- بررسی منحصر به فرد بودن در دیتابیس
- مکانیزم fallback با timestamp

### ۲. اعتبارسنجی کد رفرال
- بررسی وجود کد در جدول `users.referralCode`
- خطای مناسب برای کدهای نامعتبر

### ۳. آپدیت منطق ایجاد کاربر
- تولید کد رفرال منحصر به فرد برای کاربران جدید
- تنظیم `referredBy` از `incomingReferral` معتبر

### ۴. آپدیت migration های اصلی
- تغییر طول فیلدهای رفرال از ۵ به ۶ کاراکتر
- پاک کردن migration های اضافی

### ۵. آپدیت DTOها
- تغییر validation طول کد رفرال به ۶ کاراکتر
- آپدیت Swagger documentation

## تست‌ها

* **مسیر فایل تست**: `src/tests/auth-referral.spec.ts`
* **سناریوهای تست**:
  * تولید کد رفرال منحصر به فرد
  * اعتبارسنجی کد رفرال معتبر
  * رد کردن کد رفرال نامعتبر
  * ایجاد کاربر جدید با کد رفرال
  * عدم تغییر کاربر موجود
* **پوشش تست**: ≥ 80%

## نکات تکمیلی

### محدودیت‌ها و اعتبارسنجی‌ها:
* کد رفرال باید دقیقاً ۶ کاراکتر باشد
* کد رفرال باید منحصر به فرد باشد
* کد رفرال ورودی باید در دیتابیس وجود داشته باشد

### یادداشت‌های مهم:
* سیستم برای کاربران موجود هیچ تغییری اعمال نمی‌کند
* کد رفرال تنها یک بار در زمان ایجاد کاربر تولید می‌شود
* مکانیزم جلوگیری از حلقه بی‌نهایت در تولید کد منحصر به فرد

### ارجاع به مستندهای مرتبط:
* [AUTH_GUIDELINES.markdown](../AUTH_GUIDELINES.markdown)
* [SWAGGER_GUIDELINES.markdown](../SWAGGER_GUIDELINES.markdown)
* [API_GUIDELINES.markdown](../API_GUIDELINES.markdown)

## تغییرات نسبت به نسخه قبلی

* **اولین نسخه**: پیاده‌سازی کامل سیستم رفرال
* **فیلدهای اضافه شده**: `referralCode`, `referredBy` (۶ کاراکتر)
* **تغییرات منطق**: اعتبارسنجی کد رفرال ورودی
* **تغییرات API**: پارامتر `incomingReferral` در endpointهای auth
* **migrationها**: آپدیت طول فیلدهای رفرال در migration های اصلی










