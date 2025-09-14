# راهنمای قبل از شروع آپدیت تسک

این سند چک‌لیست اقدامات لازم قبل از آپدیت تسک در پروژه‌های NestJS را ارائه می‌دهد.

## فهرست محتوا
- [چک‌لیست قبل از آپدیت](#چک‌لیست-قبل-از-آپدیت)
- [نکات](#نکات)
- [منابع مرتبط](#منابع-مرتبط)

---

## چک‌لیست قبل از آپدیت
- [ ] **بررسی نسخه‌ها**:
  - Node.js: 18+.
  - npm, NestJS, TypeScript: طبق `package.json`.
- [ ] **بررسی فایل‌های تنظیمات**:
  - `.env`, `nest-cli.json`, `tsconfig.json`.
- [ ] **مطالعه مستندات**:
  - CODING_GUIDELINES, API_GUIDELINES, AUTH_GUIDELINES, TESTING_GUIDELINES, SWAGGER_GUIDELINES.
- [ ] **شناسایی تسک اصلی**:
  - داکیومنت تسک در `docs/tasks/` (مثل `[shamsiDate]-[TaskID]-[TaskName].md`).
  - تغییرات را از صاحب پروژه دریافت کنید.
- [ ] **ساخت برنچ**:
  - فرمت: `[نوع تغییر]-[TaskID]-[توضیح مختصر آپدیت]` (مثل `Update-T123-Revise-user-management`).
  - دستور:
    ```bash
    git checkout develop
    git pull
    git checkout -b Update-T123-Revise-user-management
    ```
- [ ] **تأیید کاربر**:
  - تأیید بگیرید.

## نکات
- **تغییرات** با ARCHITECTURE.markdown هم‌خوانی داشته باشند.
- برای **مستندسازی** به SWAGGER_GUIDELINES.markdown مراجعه کنید.

---

## منابع مرتبط
- [ARCHITECTURE.markdown](./ARCHITECTURE.markdown) - معماری پروژه
- [SWAGGER_GUIDELINES.markdown](./SWAGGER_GUIDELINES.markdown) - مستندسازی
- [after_update.markdown](./after_update.markdown) - چک‌لیست بعد از آپدیت