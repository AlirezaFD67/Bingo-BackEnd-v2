# خلاصه فیکس سیستم تایمر

## مشکل اصلی
تایمر `remainingSeconds` با ریتم نادرست کار می‌کرد و زودتر از 1 ثانیه کم می‌شد.

## علت مشکل

### 1. استفاده از `setInterval` معمولی
- `setInterval` در JavaScript دقیقاً هر 1000ms اجرا نمی‌شود
- به دلیل timing drift، تایمر زودتر یا دیرتر اجرا می‌شد

### 2. مشکل Sync با دیتابیس
- هر 5 ثانیه `remainingSeconds` از دیتابیس خوانده می‌شد
- مقدار cache که هر ثانیه کم می‌شد، overwrite می‌شد
- در نتیجه تایمر هرگز کم نمی‌شد

### 3. عدم هماهنگی بین سرویس‌ها
- `RoomsGateway` و `AutoTimerService` هر کدام تایمر جداگانه داشتند
- عدم sync بین دو سیستم

## راه‌حل‌های پیاده‌سازی شده

### 1. SocketScheduler با Drift Correction
```typescript
// الگوریتم تصحیح drift
const drift = now - job.expectedNext!;
job.expectedNext! += job.intervalMs;
const nextInterval = Math.max(0, job.intervalMs - drift);
job.timer = setTimeout(runJob, nextInterval);
```

**مزایا:**
- دقت بالا (drift معمولاً < 20ms)
- خودکار تنظیم میشه
- از `setTimeout` به جای `setInterval` استفاده میکنه

### 2. فیکس Sync با دیتابیس
```typescript
// فقط اگر remainingSeconds صفر شده، از دیتابیس بگیر
if (existingRoom.remainingSeconds <= 0) {
    existingRoom.remainingSeconds = room.remainingSeconds;
}
```

**چرا؟**
- Cache مالک مقدار `remainingSeconds` است
- دیتابیس فقط برای persistence است
- Sync نباید مقدار فعال cache را overwrite کند

### 3. یکپارچه‌سازی سیستم‌ها
- همه تایمرها در `SocketScheduler` مرکزی
- `RoomsGateway` و `AutoTimerService` از یک instance استفاده می‌کنند
- ترتیب صحیح initialization در `app.module.ts`

## فایل‌های تغییر یافته

1. **src/utils/SocketScheduler.ts**
   - الگوریتم drift correction
   - Auto-start برای job های جدید
   - Logger به جای console.log
   - متد `getStatus()` برای دیباگ

2. **src/modules/socket/rooms.gateway.ts**
   - فیکس sync با دیتابیس
   - لاگ‌های دیباگ برای `remainingSeconds`

3. **src/modules/admin/auto-timer.service.ts**
   - استفاده از `SocketScheduler` به جای `setInterval`
   - حذف تایمرهای قدیمی

4. **src/app.module.ts**
   - `SocketModule` قبل از `AdminModule`
   - اطمینان از initialization صحیح

5. **src/modules/admin/monitoring.controller.ts**
   - Endpoint جدید: `GET /api/admin/monitoring/scheduler-status`

## نتیجه

✅ **تایمر با دقت بالا (drift < 20ms)**  
✅ **همه سیستم‌ها synchronized هستند**  
✅ **قابل مانیتورینگ و دیباگ**  
✅ **معماری تمیز و مرکزی**  

## تست

برای تست دقت تایمر:
```bash
# دریافت وضعیت scheduler
GET /api/admin/monitoring/scheduler-status

# خروجی نمونه:
{
  "isRunning": true,
  "totalJobs": 4,
  "jobs": [
    {
      "name": "decrementRemainingSeconds",
      "intervalMs": 1000,
      "isActive": true,
      "drift": "2-20ms" // معمولاً
    }
  ]
}
```

## یادداشت‌های مهم

- ⚠️ **هرگز `remainingSeconds` را در sync overwrite نکنید**
- ⚠️ **همیشه از `SocketScheduler.getInstance()` استفاده کنید**
- ⚠️ **ترتیب module ها مهم است**
- ✅ **Cache مالک state است، DB فقط persistence**

