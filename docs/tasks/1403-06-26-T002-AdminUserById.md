# T002: پیاده‌سازی API دریافت کاربر ادمین بر اساس ID

## تاریخ شمسی
1403/06/26

## توضیح کلی

* **هدف تسک**: پیاده‌سازی endpoint GET `/api/admin/users/{id}` برای دریافت اطلاعات کامل کاربر بر اساس ID توسط ادمین‌ها
* **ابزارها و کتابخانه‌ها**: NestJS, TypeORM, JWT, Swagger
* **قواعد و مستندهای مرتبط**: AUTH_GUIDELINES.markdown, SWAGGER_GUIDELINES.markdown, API_GUIDELINES.markdown

## رفتار دقیق تسک (Behavior)

### ۱. احراز هویت و مجوزدهی
- بررسی توکن JWT معتبر در header Authorization
- بررسی نقش کاربر (باید ADMIN باشد)
- در صورت عدم وجود یا عدم تطابق، خطای 401 برگردانده شود

### ۲. دریافت کاربر بر اساس ID
- دریافت پارامتر `id` از مسیر URL
- جستجو کاربر در جدول `users` بر اساس `id`
- اگر کاربر یافت نشد، خطای 404 با پیام "کاربر یافت نشد" برگردانده شود

### ۳. آماده‌سازی داده‌های خروجی
- تبدیل `createdAt` به فرمت ISO string
- محاسبه `createdAtPersian` با تبدیل تاریخ میلادی به شمسی
- فرمت‌بندی `bankCardNumber` (حذف spaceها)
- بازگشت تمامی فیلدهای مورد نیاز در فرمت مشخص

### ۴. بازگشت پاسخ
- کد وضعیت 200 در صورت موفقیت
- داده‌های کاربر در فرمت JSON طبق مشخصات API

## جداول و ارتباطات

### جدول‌های اصلی و ارتباطات:
* **جدول اصلی**: `users`
* **ارتباط با جداول دیگر**: بدون ارتباط مستقیم با جداول دیگر

### فیلدهای کلیدی:
* `users.id`: number PRIMARY KEY - شناسه منحصر به فرد کاربر
* `users.username`: string NULLABLE - نام کاربری
* `users.firstName`: string NULLABLE - نام
* `users.lastName`: string NULLABLE - نام خانوادگی
* `users.phoneNumber`: string NOT NULL - شماره تلفن
* `users.bankCardNumber`: string NULLABLE - شماره کارت بانکی
* `users.shebaNumber`: string(26) NULLABLE - شماره شبا
* `users.referralCode`: string(6) NULLABLE - کد معرف
* `users.referredBy`: string(6) NULLABLE - کد معرف کننده
* `users.role`: enum('USER', 'ADMIN') - نقش کاربر
* `users.createdAt`: Date - تاریخ ایجاد حساب (میلادی)
* `users.createdAtPersian`: string - تاریخ ایجاد حساب (شمسی - محاسبه شده)

### تغییرات دیتابیس:
* **migration لازم**: بدون نیاز به migration جدید
* **تغییرات**: استفاده از فیلدهای موجود در جدول `users`

## APIها و Endpointها

### endpointهای مرتبط:

#### GET `/api/admin/users/{id}`
* **متد**: GET
* **مسیر**: `/api/admin/users/{id}`
* **هدرهای مورد نیاز**:
  * `Authorization`: Bearer {token}
* **پارامترهای مسیر**:
  * `id`: number (شناسه کاربر)
* **خروجی (200)**:
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
    "createdAt": "2024-06-20T12:34:56.789Z",
    "createdAtPersian": "1403/03/31"
  }
  ```
* **خطاها**:
  * `401`: توکن معتبر نیست یا کاربر ادمین نیست
  * `404`: کاربر یافت نشد

## مراحل انجام (Step by Step)

### ۱. آپدیت AdminUserResponseDto
- اضافه کردن فیلدهای `referralCode` و `referredBy`
- آپدیت Swagger documentation برای فیلدهای جدید

### ۲. آپدیت UsersService
- آپدیت متد `getAllUsers()` برای شامل کردن فیلدهای رفرال
- ایجاد متد جدید `getUserById(id: number)` برای دریافت کاربر واحد

### ۳. آپدیت AdminController
- اضافه کردن endpoint جدید `GET /api/admin/users/:id`
- اضافه کردن decoratorهای امنیتی (JwtAuthGuard, Roles)
- اضافه کردن Swagger documentation

### ۴. تست و بررسی
- کامپایل پروژه برای اطمینان از نبود خطا
- بررسی عملکرد endpoint با Postman/Swagger

## تست‌ها

* **مسیر فایل تست**: `src/tests/admin-users.spec.ts`
* **سناریوهای تست**:
  * دریافت کاربر موجود با ID معتبر (ادمین)
  * دریافت کاربر موجود با ID معتبر (کاربر عادی - خطای 401)
  * دریافت کاربر ناموجود (خطای 404)
  * دریافت کاربر بدون توکن (خطای 401)
* **پوشش تست**: ≥ 80%

## نکات تکمیلی

### محدودیت‌ها و اعتبارسنجی‌ها:
* تنها کاربران با نقش ADMIN می‌توانند از این endpoint استفاده کنند
* پارامتر `id` باید عدد صحیح مثبت باشد
* اگر کاربر یافت نشد، خطای 404 برگردانده شود

### یادداشت‌های مهم:
* endpoint جدید هیچ تغییری در داده‌های کاربران ایجاد نمی‌کند
* اطلاعات حساس (رمز عبور و غیره) در پاسخ شامل نمی‌شود
* تاریخ شمسی با استفاده از تابع `convertToPersianDate()` محاسبه می‌شود

### ارجاع به مستندهای مرتبط:
* [AUTH_GUIDELINES.markdown](../AUTH_GUIDELINES.markdown)
* [SWAGGER_GUIDELINES.markdown](../SWAGGER_GUIDELINES.markdown)
* [API_GUIDELINES.markdown](../API_GUIDELINES.markdown)

## تغییرات نسبت به نسخه قبلی

* **اولین نسخه**: پیاده‌سازی کامل endpoint دریافت کاربر ادمین
* **فیلدهای اضافه شده**: `referralCode`, `referredBy` در AdminUserResponseDto
* **تغییرات منطق**: اضافه کردن متد `getUserById()` در UsersService
* **تغییرات API**: endpoint جدید GET `/api/admin/users/{id}`
* **migrationها**: بدون نیاز به migration جدید
