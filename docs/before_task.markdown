# راهنمای قبل از شروع تسک

این سند چک‌لیست اقدامات لازم قبل از شروع هر تسک در پروژه‌های NestJS را ارائه می‌دهد. توسعه‌دهندگان (AI یا انسان) باید این مراحل را به ترتیب انجام دهند.

## فهرست محتوا
- [چک‌لیست قبل از شروع](#چک‌لیست-قبل-از-شروع)
- [نکات](#نکات)
- [منابع مرتبط](#منابع-مرتبط)

---

## چک‌لیست قبل از شروع
- [ ] **بررسی نسخه‌ها**:
  - Node.js: نسخه 18 یا بالاتر (یا نسخه مشخص‌شده در پروژه).
  - pnpm: آخرین نسخه پایدار.
  - NestJS: نسخه مشخص‌شده در `package.json`.
  - TypeScript: نسخه سازگار با پروژه.
- [ ] **بررسی فایل‌های تنظیمات**:
  - فایل `.env` برای متغیرهای محیطی (طبق GENERAL_GUIDELINES.markdown).
  - فایل `nest-cli.json` و `tsconfig.json` برای تنظیمات پروژه.
  - فایل `.gitignore` برای جلوگیری از ورود فایل‌های غیرضروری به گیت.
- [ ] **مطالعه مستندات**:
  - CODING_GUIDELINES.markdown: برای نام‌گذاری و سازمان‌دهی فایل‌ها.
  - API_GUIDELINES.markdown: برای پیاده‌سازی APIها.
  - AUTH_GUIDELINES.markdown: برای احراز هویت.
  - TESTING_GUIDELINES.markdown: برای تست‌نویسی.
  - SWAGGER_GUIDELINES.markdown: برای مستندسازی.
- [ ] **ساخت برنچ**:
  - وقتی گفته می‌شود "برنچ بساز"، یک برنچ جدید از روی برنچ `develop` با فرمت `[نوع تغییر]-[TaskID]-[توضیح مختصر]` ایجاد کنید.
  - انواع تغییر: `Feat`, `Fix`, `Add`, `Update`, `Refactor`, `Remove`.
  - مثال: `Feat-T123-Add-user-management`
  - دستور نمونه:
    ```bash
    git checkout develop
    git pull
    git checkout -b Feat-T123-Add-user-management
    ```
- [ ] **تأیید کاربر**:
  - قبل از شروع تسک، تأیید کاربر (صاحب پروژه) را دریافت کنید.

## نکات
- برای **جزئیات بیشتر** به TASK_DOCUMENTATION_GUIDELINES.markdown مراجعه کنید.
- از تکرار کدها یا استفاده از ابزارهای غیراستاندارد پرهیز کنید.
- اطمینان حاصل کنید که محیط توسعه شما با پروژه سازگار است.

---

## منابع مرتبط
- [TASK_DOCUMENTATION_GUIDELINES.markdown](./TASK_DOCUMENTATION_GUIDELINES.markdown) - راهنمای مستندسازی
- [CODING_GUIDELINES.markdown](./CODING_GUIDELINES.markdown) - کدنویسی
- [after_task.markdown](./after_task.markdown) - چک‌لیست بعد از تسک