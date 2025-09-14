# راهنمای قبل از شروع آپدیت سوکت

این سند چک‌لیست اقدامات لازم قبل از آپدیت سوکت‌ها را ارائه می‌دهد.

## چک‌لیست قبل از آپدیت
- [ ] **بررسی نسخه‌ها**:
  - Node.js: 18+.
  - NestJS: از `package.json`.
  - پکیج‌ها: `@nestjs/websockets`, `socket.io`, `socket.io-client`.
- [ ] **بررسی معماری سوکت**:
  - ساختار فولدرها: `src/modules/socket/`, `src/modules/socket-mock/`, `docs/tasks/socket/`.
  - namespaceها: `/socket/admin/...`, `/socket/user/...`.
  - وابستگی‌ها: `@nestjs/websockets`, `socket.io`, `socket.io-client`.
- [ ] **بررسی فایل‌های تنظیمات**:
  - `.env`, `nest-cli.json`, `tsconfig.json`.
- [ ] **مطالعه مستندات**:
  - CODING_GUIDELINES, AUTH_GUIDELINES, TESTING_GUIDELINES, SWAGGER_GUIDELINES.
- [ ] **شناسایی تسک اصلی**:
  - داکیومنت اصلی را در `docs/tasks/socket/` (مثل `[shamsiDate]-[TaskID]-[TaskName].md`) پیدا کنید.
  - تغییرات را از صاحب پروژه دریافت کنید.
- [ ] **بررسی کدنویسی سوکت**:
  - محل فایل‌ها: `src/modules/socket/` برای ماژول سوکت، `src/modules/socket-mock/` برای mockها.
  - نام‌گذاری: فایل‌ها با PascalCase، فولدرها با kebab-case.
  - استفاده از ابزارها: `@nestjs/websockets`, `@nestjs/jwt` برای احراز هویت سوکت.
- [ ] **ساخت برنچ**:
  - فرمت: `[نوع تغییر]-[TaskID]-[توضیح مختصر آپدیت]` (مثل `Update-T123-Revise-socket-general`).
  - دستور:
    ```bash
    git checkout develop
    git pull
    git checkout -b Update-T123-Revise-socket-general
    ```
- [ ] **تأیید کاربر**:
  - تأیید بگیرید.

## نکات
- تغییرات با ARCHITECTURE.markdown هم‌خوانی داشته باشند.
- برای مستندسازی به SWAGGER_GUIDELINES.markdown مراجعه کنید.