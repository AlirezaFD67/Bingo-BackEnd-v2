# نمای کلی داکیومنت‌های پروژه NestJS

این فایل معرفی کلی داکیومنت‌های پروژه‌های مبتنی بر NestJS را ارائه می‌دهد. این داکیومنت‌ها برای استانداردسازی توسعه، کدنویسی، و مستندسازی طراحی شده‌اند.

## فهرست محتوا
- [معرفی پروژه](#معرفی-پروژه)
- [لیست داکیومنت‌ها](#لیست-داکیومنت‌ها)
- [جریان کاری کلی](#جریان-کاری-کلی)
- [نکات سریع](#نکات-سریع)

---

## معرفی پروژه
این مجموعه داکیومنت‌ها برای توسعه پروژه‌های NestJS با تمرکز بر کیفیت، استاندارد، و قابلیت نگهداری طراحی شده‌اند. تمامی داکیومنت‌ها به فارسی نوشته شده‌اند تا دسترسی آسان‌تر باشد.

**نکته مهم**: داکیومنت‌های سوکت (مثل before_socket.markdown) فقط در پروژه‌های دارای سوکت استفاده شوند. داکیومنت‌های دیگر برای تمامی پروژه‌ها کاربرد دارند.

---

## لیست داکیومنت‌ها
- **[ARCHITECTURE.markdown](./ARCHITECTURE.markdown)**: معماری کلی پروژه، وابستگی‌ها، و ساختار فولدرها.
- **[CODING_GUIDELINES.markdown](./CODING_GUIDELINES.markdown)**: راهنمای کدنویسی، نام‌گذاری، و سازمان فایل‌ها.
- **[API_GUIDELINES.markdown](./API_GUIDELINES.markdown)**: پیاده‌سازی APIها، کنترلرها، و عملیات CRUD.
- **[AUTH_GUIDELINES.markdown](./AUTH_GUIDELINES.markdown)**: راهنمای احراز هویت و مدیریت دسترسی.
- **[SWAGGER_GUIDELINES.markdown](./SWAGGER_GUIDELINES.markdown)**: مستندسازی APIها با Swagger.
- **[TESTING_GUIDELINES.markdown](./TESTING_GUIDELINES.markdown)**: راهنمای تست‌نویسی با Jest.
- **[GENERAL_GUIDELINES.markdown](./GENERAL_GUIDELINES.markdown)**: راهنمای عمومی شامل نصب پکیج‌ها، خطاها، و لاگ‌گیری.
- **[TASK_DOCUMENTATION_GUIDELINES.markdown](./TASK_DOCUMENTATION_GUIDELINES.markdown)**: راهنمای مستندسازی تسک‌ها.
- **[before_task.markdown](./before_task.markdown)**: چک‌لیست قبل از شروع تسک.
- **[after_task.markdown](./after_task.markdown)**: چک‌لیست بعد از پایان تسک.
- **[before_update.markdown](./before_update.markdown)**: چک‌لیست قبل از آپدیت تسک.
- **[after_update.markdown](./after_update.markdown)**: چک‌لیست بعد از آپدیت تسک.
- **داکیومنت‌های سوکت** (فقط برای پروژه‌های دارای سوکت):
  - [before_socket.markdown](./before_socket.markdown)
  - [after_socket.markdown](./after_socket.markdown)
  - [before_socket_update.markdown](./before_socket_update.markdown)
  - [after_socket_update.markdown](./after_socket_update.markdown)

---

## جریان کاری کلی
1. **شروع پروژه**: ARCHITECTURE.markdown و GENERAL_GUIDELINES.markdown را مطالعه کنید.
2. **قبل از تسک**: از before_task.markdown (یا before_update.markdown برای آپدیت) استفاده کنید.
3. **در حین تسک**: از CODING_GUIDELINES.markdown، API_GUIDELINES.markdown، و غیره پیروی کنید.
4. **مستندسازی**: SWAGGER_GUIDELINES.markdown و TASK_DOCUMENTATION_GUIDELINES.markdown را اعمال کنید.
5. **تست‌نویسی**: TESTING_GUIDELINES.markdown را دنبال کنید.
6. **پایان تسک**: after_task.markdown (یا after_update.markdown) را چک کنید.

برای پروژه‌های دارای سوکت، از داکیومنت‌های سوکت جداگانه استفاده کنید.

---

## نکات سریع
- **برای شروع سریع**: همیشه از before_task.markdown شروع کنید.
- **اگر پروژه دارای سوکت است**: داکیومنت‌های سوکت را بررسی کنید.
- **به‌روزرسانی داکیومنت‌ها**: در صورت نیاز، تغییرات را با تیم هماهنگ کنید.
- **ارجاعات**: هر داکیومنت به منابع مرتبط ارجاع می‌دهد.

## منابع مرتبط
- [معرفی NestJS](https://docs.nestjs.com/)
- [راهنمای Markdown](https://www.markdownguide.org/)
