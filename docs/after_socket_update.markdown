# راهنمای بعد از پایان آپدیت سوکت

این سند چک‌لیست اقدامات لازم بعد از آپدیت سوکت‌ها را ارائه می‌دهد.

## چک‌لیست بعد از آپدیت
- [ ] **مستندسازی آپدیت**:
  - در `docs/tasks/socket/[shamsiDate]-[TaskID]-[TaskName]-v[n].md` طبق TASK_DOCUMENTATION_GUIDELINES.
- [ ] **مستندسازی Swagger**:
  - mockها را در `src/modules/socket-mock/` طبق SWAGGER_GUIDELINES.markdown به‌روزرسانی کنید.
  - برای سوکت‌ها، از endpointهای HTTP mock استفاده کنید تا eventها را مستند کنید.
  - مثال: POST `/socket/general/emit-message` برای event `emitMessage`.
- [ ] **تست‌نویسی**:
  - تست‌ها را در `src/tests/socket/[FeatureName].spec.ts` به‌روزرسانی کنید (پوشش 80%+).
  - مثال: تست اتصال و emit event با `io('http://localhost:3000/socket/general', { auth: { token: 'jwt' } })`.
- [ ] **به‌روزرسانی ارورها**:
  - در `src/common/filters/socket-exception.filter.ts` و `src/common/constants/error-messages.ts`.
- [ ] **پیشنهاد کامیت**:
  - فرمت: `[نوع تغییر]: [توضیح مختصر آپدیت]` (مثل `Update: Revise socket general`).
- [ ] **بررسی کیفیت**:
  - تست سازگاری.
- [ ] **تأیید کاربر**:
  - تأیید بگیرید.
- [ ] **اطلاع‌رسانی**:
  - از pull request.

## نکات
- برای مستندسازی به SWAGGER_GUIDELINES.markdown مراجعه کنید.
- با ARCHITECTURE.markdown هم‌خوانی داشته باشد.