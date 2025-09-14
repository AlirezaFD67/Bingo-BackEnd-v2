# راهنمای بعد از پایان تسک

این سند چک‌لیست اقدامات لازم بعد از اتمام هر تسک در پروژه‌های NestJS را ارائه می‌دهد.

## فهرست محتوا
- [چک‌لیست بعد از تسک](#چک‌لیست-بعد-از-تسک)
- [نکات](#نکات)
- [منابع مرتبط](#منابع-مرتبط)

---

## چک‌لیست بعد از تسک
- [ ] **مستندسازی تسک**:
  - منطق تسک را در `docs/tasks/[shamsiDate]-[TaskID]-[TaskName].md` طبق TASK_DOCUMENTATION_GUIDELINES.markdown ثبت کنید.
  - مثال: `docs/tasks/1404-05-01-T123-UserManagement.md`
- [ ] **مستندسازی APIها**:
  - endpointهای جدید را در `docs/api/endpoints/` طبق SWAGGER_GUIDELINES.markdown مستند کنید.
- [ ] **تست‌نویسی**:
  - تست‌ها در `src/tests/[FeatureName].spec.ts` طبق TESTING_GUIDELINES.markdown.
  - پوشش تست 80%+ (با `npm run test -- --coverage`).
- [ ] **به‌روزرسانی ارورها**:
  - ارورهای جدید را در `src/common/filters/http-exception.filter.ts` و `src/common/constants/error-messages.ts` طبق GENERAL_GUIDELINES.markdown.
- [ ] **پیشنهاد عنوان کامیت**:
  - فرمت: `[نوع تغییر]: [توضیح مختصر]` (مثل `Feat: Add user management`).
- [ ] **بررسی کیفیت**:
  - فایل‌های اضافی را حذف کنید.
- [ ] **تأیید کاربر**:
  - تأیید کاربر را دریافت کنید.
- [ ] **اطلاع‌رسانی به تیم**:
  - از pull request یا کامیت.

## نکات
- برای **مستندسازی** به SWAGGER_GUIDELINES.markdown مراجعه کنید.
- از پکیج‌های غیراستاندارد پرهیز کنید.

---

## منابع مرتبط
- [SWAGGER_GUIDELINES.markdown](./SWAGGER_GUIDELINES.markdown) - مستندسازی
- [TASK_DOCUMENTATION_GUIDELINES.markdown](./TASK_DOCUMENTATION_GUIDELINES.markdown) - راهنمای مستندسازی تسک
- [before_task.markdown](./before_task.markdown) - چک‌لیست قبل از تسک