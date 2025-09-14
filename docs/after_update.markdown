# راهنمای بعد از پایان آپدیت تسک

این سند چک‌لیست اقدامات لازم بعد از آپدیت تسک در پروژه‌های NestJS را ارائه می‌دهد.

## فهرست محتوا
- [چک‌لیست بعد از آپدیت](#چک‌لیست-بعد-از-آپدیت)
- [نکات](#نکات)
- [منابع مرتبط](#منابع-مرتبط)

---

## چک‌لیست بعد از آپدیت
- [ ] **مستندسازی آپدیت**:
  - در `docs/tasks/[shamsiDate]-[TaskID]-[TaskName]-v[n].md` طبق TASK_DOCUMENTATION_GUIDELINES.
- [ ] **مستندسازی APIها**:
  - endpointهای تغییرکرده را طبق SWAGGER_GUIDELINES.markdown به‌روزرسانی کنید.
- [ ] **تست‌نویسی**:
  - تست‌ها را در `src/tests/[FeatureName].spec.ts` به‌روزرسانی کنید (پوشش 80%+).
- [ ] **به‌روزرسانی ارورها**:
  - در `src/common/filters/http-exception.filter.ts` و `src/common/constants/error-messages.ts`.
- [ ] **پیشنهاد کامیت**:
  - فرمت: `[نوع تغییر]: [توضیح مختصر آپدیت]` (مثل `Update: Revise user management`).
- [ ] **بررسی کیفیت**:
  - تست سازگاری.
- [ ] **تأیید کاربر**:
  - تأیید بگیرید.
- [ ] **اطلاع‌رسانی**:
  - از pull request.

## نکات
- برای **مستندسازی** به SWAGGER_GUIDELINES.markdown مراجعه کنید.
- **تغییرات** با ARCHITECTURE.markdown هم‌خوانی داشته باشند.

---

## منابع مرتبط
- [SWAGGER_GUIDELINES.markdown](./SWAGGER_GUIDELINES.markdown) - مستندسازی
- [ARCHITECTURE.markdown](./ARCHITECTURE.markdown) - معماری پروژه
- [before_update.markdown](./before_update.markdown) - چک‌لیست قبل از آپدیت