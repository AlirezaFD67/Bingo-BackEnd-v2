# T003: پیاده‌سازی API به‌روزرسانی کاربر توسط ادمین

## تاریخ شمسی
1404/07/26

## توضیح کلی

* **هدف تسک**: پیاده‌سازی endpoint PUT `/api/admin/users/{id}` برای به‌روزرسانی اطلاعات کاربر توسط ادمین‌ها
* **ابزارها و کتابخانه‌ها**: NestJS, TypeORM, JWT, Swagger, class-validator
* **قواعد و مستندهای مرتبط**: AUTH_GUIDELINES.markdown, SWAGGER_GUIDELINES.markdown, API_GUIDELINES.markdown

## رفتار دقیق تسک (Behavior)

### ۱. احراز هویت و مجوزدهی
- بررسی توکن JWT معتبر در header Authorization
- بررسی نقش کاربر (باید ADMIN باشد)
- در صورت عدم وجود یا عدم تطابق، خطای 401 برگردانده شود

### ۲. دریافت و اعتبارسنجی داده‌های ورودی
- دریافت پارامتر `id` از مسیر URL
- دریافت داده‌های به‌روزرسانی از body درخواست
- اعتبارسنجی داده‌های ورودی طبق قوانین مشخص شده
- اگر داده‌ها نامعتبر باشند، خطای 400 برگردانده شود

### ۳. جستجو و به‌روزرسانی کاربر
- جستجو کاربر در جدول `users` بر اساس `id`
- اگر کاربر یافت نشد، خطای 404 با پیام "کاربر یافت نشد" برگردانده شود
- بررسی تکراری نبودن username (در صورت ارسال)
- به‌روزرسانی فیلدهای کاربر با داده‌های جدید

### ۴. آماده‌سازی داده‌های خروجی
- تبدیل `createdAt` به فرمت ISO string
- محاسبه `createdAtPersian` با تبدیل تاریخ میلادی به شمسی
- فرمت‌بندی `bankCardNumber` (حذف spaceها)
- بازگشت تمامی فیلدهای کاربر در فرمت مشخص

### ۵. بازگشت پاسخ
- کد وضعیت 200 در صورت موفقیت
- داده‌های کاربر به‌روزرسانی شده در فرمت JSON

## جداول و ارتباطات

### جدول‌های اصلی و ارتباطات:
* **جدول اصلی**: `users`
* **ارتباط با جداول دیگر**: بدون ارتباط مستقیم با جداول دیگر

### فیلدهای کلیدی:
* `users.id`: number PRIMARY KEY - شناسه منحصر به فرد کاربر
* `users.username`: string NULLABLE UNIQUE - نام کاربری
* `users.firstName`: string NULLABLE - نام
* `users.lastName`: string NULLABLE - نام خانوادگی
* `users.phoneNumber`: string NOT NULL - شماره تلفن
* `users.bankCardNumber`: string NULLABLE - شماره کارت بانکی
* `users.shebaNumber`: string(26) NULLABLE - شماره شبا
* `users.referralCode`: string(6) NULLABLE - کد معرف
* `users.referredBy`: string(6) NULLABLE - کد معرف کننده
* `users.role`: enum('USER', 'ADMIN') - نقش کاربر
* `users.createdAt`: Date - تاریخ ایجاد حساب (میلادی)

### تغییرات دیتابیس:
* **migration لازم**: بدون نیاز به migration جدید
* **تغییرات**: استفاده از فیلدهای موجود در جدول `users`

## APIها و Endpointها

### endpointهای مرتبط:

#### PUT `/api/admin/users/{id}`
* **متد**: PUT
* **مسیر**: `/api/admin/users/{id}`
* **هدرهای مورد نیاز**:
  * `Authorization`: Bearer {token}
  * `Content-Type`: application/json
* **پارامترهای مسیر**:
  * `id`: number (شناسه کاربر)
* **بدنه درخواست**:
  ```json
  {
    "username": "new_username",
    "firstName": "علی",
    "lastName": "احمدی",
    "bankCardNumber": "1111222233334444",
    "shebaNumber": "IR123456789012345678901234"
  }
  ```
* **خروجی (200)**:
  ```json
  {
    "id": 1,
    "username": "new_username",
    "firstName": "علی",
    "lastName": "احمدی",
    "phoneNumber": "09123456789",
    "bankCardNumber": "1111222233334444",
    "shebaNumber": "IR123456789012345678901234",
    "referralCode": "12345",
    "referredBy": "67890",
    "role": "USER",
    "createdAt": "2024-06-20T12:34:56.789Z",
    "createdAtPersian": "1403/03/31"
  }
  ```
* **خطاها**:
  * `400`: داده‌های ورودی معتبر نیستند
  * `401`: توکن معتبر نیست یا کاربر ادمین نیست
  * `404`: کاربر یافت نشد
  * `409`: نام کاربری تکراری است

## مراحل انجام (Step by Step)

### ۱. اضافه کردن متد updateUserById به UsersService
- اضافه کردن متد `updateUserById(id: number, updateData: UpdateUserProfileDto)`
- پیاده‌سازی منطق جستجو و به‌روزرسانی کاربر
- اضافه کردن بررسی تکراری بودن username
- بازگشت داده‌های کاربر به‌روزرسانی شده

### ۲. اضافه کردن endpoint PUT به AdminController
- اضافه کردن متد `updateUserById()` به AdminController
- اضافه کردن decoratorهای امنیتی (JwtAuthGuard, Roles)
- اضافه کردن Swagger documentation
- اضافه کردن validation برای پارامترها

### ۳. تست و بررسی
- کامپایل پروژه برای اطمینان از نبود خطا
- بررسی عملکرد endpoint با curl/Postman

## نکات تکمیلی

### محدودیت‌ها و اعتبارسنجی‌ها:
* تنها کاربران با نقش ADMIN می‌توانند از این endpoint استفاده کنند
* پارامتر `id` باید عدد صحیح مثبت باشد
* تمام فیلدهای ورودی اختیاری هستند
* username باید منحصر به فرد باشد (در صورت ارسال)
* فرمت شماره کارت بانکی باید معتبر باشد
* فرمت شماره شبا باید معتبر باشد (IR + 24 رقم)

### یادداشت‌های مهم:
* از DTO موجود `UpdateUserProfileDto` برای اعتبارسنجی ورودی استفاده می‌شود
* اطلاعات حساس (رمز عبور و غیره) در پاسخ شامل نمی‌شود
* تاریخ شمسی با استفاده از تابع `convertToPersianDate()` محاسبه می‌شود
* فیلدهای خالی به null تبدیل می‌شوند

### ارجاع به مستندهای مرتبط:
* [AUTH_GUIDELINES.markdown](../AUTH_GUIDELINES.markdown)
* [SWAGGER_GUIDELINES.markdown](../SWAGGER_GUIDELINES.markdown)
* [API_GUIDELINES.markdown](../API_GUIDELINES.markdown)

## تغییرات نسبت به نسخه قبلی

* **اولین نسخه**: پیاده‌سازی کامل endpoint به‌روزرسانی کاربر ادمین
* **متدها اضافه شده**: `updateUserById()` در UsersService و AdminController
* **تغییرات منطق**: اضافه کردن منطق به‌روزرسانی کاربر با اعتبارسنجی‌ها
* **تغییرات API**: endpoint جدید PUT `/api/admin/users/{id}`
* **migrationها**: بدون نیاز به migration جدید
