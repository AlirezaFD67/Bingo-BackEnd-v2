# راهنمای بعد از پایان پیاده‌سازی سوکت

این سند چک‌لیست اقدامات لازم بعد از پیاده‌سازی سوکت‌ها را ارائه می‌دهد.

## چک‌لیست بعد از سوکت
- [ ] **مستندسازی سوکت**:
  - در `docs/tasks/socket/[shamsiDate]-[TaskID]-[TaskName].md` (مثل `1404-05-01-T123-SocketGeneral.md`) طبق TASK_DOCUMENTATION_GUIDELINES.markdown.
- [ ] **مستندسازی Swagger**:
  - mock endpointها را در `src/modules/socket-mock/` طبق SWAGGER_GUIDELINES.markdown.
  - برای سوکت‌ها، از endpointهای HTTP mock استفاده کنید تا eventها را مستند کنید.
  - مثال: POST `/socket/general/emit-message` برای event `emitMessage`.
- [ ] **تست‌نویسی**:
  - در `src/tests/socket/[FeatureName].spec.ts` با Jest و `socket.io-client`, پوشش 80%+.
  - مثال: تست اتصال و emit event با `io('http://localhost:3000/socket/general', { auth: { token: 'jwt' } })`.
- [ ] **به‌روزرسانی ارورها**:
  - در `src/common/filters/socket-exception.filter.ts` و `src/common/constants/error-messages.ts`.
- [ ] **پیشنهاد کامیت**:
  - فرمت: `[نوع تغییر]: [توضیح مختصر]` (مثل `Feat: Add socket general`).
- [ ] **بررسی کیفیت**:
  - فایل‌های اضافی را حذف کنید.
  - تست سازگاری.
- [ ] **تأیید کاربر**:
  - تأیید بگیرید.
- [ ] **اطلاع‌رسانی**:
  - از pull request.

## نکات
- برای مستندسازی به SWAGGER_GUIDELINES.markdown مراجعه کنید.
- با ARCHITECTURE.markdown هم‌خوانی داشته باشد.