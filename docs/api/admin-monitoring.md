# Admin Monitoring API

## نمای کلی
API های مانیتورینگ سیستم تایمر خودکار اتاق‌های بازی

**Base URL**: `/admin/monitoring`

**نیاز به احراز هویت**: بله (JWT Token + Admin Role)

---

## Endpoints

### 1. دریافت وضعیت تایمر اتاق‌ها

دریافت اطلاعات وضعیت تایمر تمام اتاق‌های فعال

**Endpoint**: `GET /admin/monitoring/timer-status`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "totalRooms": 10,
  "pendingRooms": 7,
  "startedRooms": 3,
  "errorRooms": 0,
  "mainLoopActive": true,
  "syncLoopActive": true,
  "rooms": [
    {
      "activeRoomId": 1,
      "gameRoomId": 5,
      "status": "pending",
      "remainingSeconds": 45,
      "drawnCount": 0,
      "remainingCount": 90,
      "errorCount": 0,
      "lastError": null,
      "timeSinceLastSync": 2500,
      "timeSinceLastDraw": null
    },
    {
      "activeRoomId": 2,
      "gameRoomId": 6,
      "status": "started",
      "remainingSeconds": 0,
      "drawnCount": 25,
      "remainingCount": 65,
      "errorCount": 0,
      "lastError": null,
      "timeSinceLastSync": 3200,
      "timeSinceLastDraw": 1500
    }
  ]
}
```

**فیلدها**:
- `totalRooms`: تعداد کل روم‌های فعال
- `pendingRooms`: تعداد روم‌های در حالت pending
- `startedRooms`: تعداد روم‌های در حال اجرا
- `errorRooms`: تعداد روم‌های با خطا
- `mainLoopActive`: وضعیت Main Loop
- `syncLoopActive`: وضعیت Sync Loop
- `rooms`: آرایه‌ای از اطلاعات تمام روم‌ها

**فیلدهای هر روم**:
- `activeRoomId`: شناسه روم فعال
- `gameRoomId`: شناسه game room
- `status`: وضعیت روم (`pending`, `started`, `finished`, `deactivated`)
- `remainingSeconds`: ثانیه‌های باقیمانده تایمر
- `drawnCount`: تعداد اعداد کشیده شده
- `remainingCount`: تعداد اعداد باقیمانده
- `errorCount`: تعداد خطاهای رخ داده
- `lastError`: آخرین خطا (null اگر خطایی نباشد)
- `timeSinceLastSync`: زمان از آخرین sync با DB (میلی‌ثانیه)
- `timeSinceLastDraw`: زمان از آخرین عدد کشیده شده (میلی‌ثانیه، null برای pending)

**Error Responses**:
- `401 Unauthorized`: توکن معتبر نیست یا کاربر ادمین نیست

---

### 2. بررسی سلامت سیستم تایمر

دریافت اطلاعات کامل سلامت سیستم تایمر شامل وضعیت حافظه، دیتابیس و مشکلات احتمالی

**Endpoint**: `GET /admin/monitoring/health`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "isHealthy": true,
  "timestamp": "2025-09-30T12:30:45.123Z",
  "memoryState": {
    "totalRooms": 10,
    "pendingRooms": 7,
    "startedRooms": 3,
    "errorRooms": 0
  },
  "databaseState": {
    "pendingRooms": 7,
    "startedRooms": 3
  },
  "loops": {
    "mainLoopActive": true,
    "mainLoopInterval": 1000,
    "syncLoopActive": true,
    "syncInterval": 5000
  },
  "issues": {
    "problematicRooms": 0,
    "outOfSyncRooms": 0,
    "details": []
  },
  "rooms": [...]
}
```

**فیلدها**:

**سطح اصلی**:
- `isHealthy`: وضعیت کلی سلامت سیستم (boolean)
- `timestamp`: زمان بررسی (ISO 8601)

**memoryState** (وضعیت در حافظه):
- `totalRooms`: تعداد کل روم‌ها در حافظه
- `pendingRooms`: تعداد روم‌های pending
- `startedRooms`: تعداد روم‌های started
- `errorRooms`: تعداد روم‌های با خطا

**databaseState** (وضعیت در دیتابیس):
- `pendingRooms`: تعداد روم‌های pending در DB
- `startedRooms`: تعداد روم‌های started در DB

**loops** (وضعیت Loop ها):
- `mainLoopActive`: وضعیت Main Loop
- `mainLoopInterval`: فاصله زمانی Main Loop (میلی‌ثانیه)
- `syncLoopActive`: وضعیت Sync Loop
- `syncInterval`: فاصله زمانی Sync (میلی‌ثانیه)

**issues** (مشکلات):
- `problematicRooms`: تعداد روم‌های مشکل‌دار
- `outOfSyncRooms`: تعداد روم‌های out of sync
- `details`: آرایه جزئیات مشکلات
  - `activeRoomId`: شناسه روم
  - `errorCount`: تعداد خطاها
  - `lastError`: آخرین خطا
  - `timeSinceLastSync`: زمان از آخرین sync

**شرایط Problematic Room**:
- `errorCount >= 3` (خطاهای تکراری)
- `timeSinceLastSync > 30000` (بیش از 30 ثانیه sync نشده)

**شرایط Out of Sync Room**:
- `timeSinceLastSync > SYNC_INTERVAL * 3` (بیش از 3 برابر فاصله sync)

**Error Responses**:
- `401 Unauthorized`: توکن معتبر نیست یا کاربر ادمین نیست
- `500 Internal Server Error`: خطا در بررسی سلامت سیستم

---

## استفاده

### cURL Examples

#### دریافت وضعیت تایمر
```bash
curl -X GET http://localhost:3000/admin/monitoring/timer-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### بررسی سلامت
```bash
curl -X GET http://localhost:3000/admin/monitoring/health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### JavaScript Example
```javascript
// دریافت وضعیت تایمر
const response = await fetch('/admin/monitoring/timer-status', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const status = await response.json();
console.log(`Total Rooms: ${status.totalRooms}`);
console.log(`Main Loop Active: ${status.mainLoopActive}`);

// بررسی سلامت
const healthResponse = await fetch('/admin/monitoring/health', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const health = await healthResponse.json();
if (health.isHealthy) {
  console.log('System is healthy');
} else {
  console.warn('System has issues:', health.issues);
}
```

---

## نکات مهم

### Performance
- این endpoint ها سبک هستند و از حافظه اطلاعات می‌خوانند
- `health` endpoint یک Query به دیتابیس می‌زند (برای مقایسه)
- مناسب برای monitoring و dashboard

### Monitoring
- برای dashboard های admin استفاده کنید
- هر 5-10 ثانیه polling کنید (برای real-time)
- از `isHealthy` برای alerting استفاده کنید

### Security
- فقط ادمین‌ها دسترسی دارند
- نیاز به JWT Token با role ADMIN
- اطلاعات حساس سیستم را نشان می‌دهد

---

## وضعیت‌های ممکن

### Room Status
- `pending`: منتظر شروع
- `started`: در حال اجرا
- `finished`: پایان یافته
- `deactivated`: غیرفعال (به دلیل خطا یا دیگر دلایل)

### Health Status
- `isHealthy: true`: همه چیز عادی است
- `isHealthy: false`: مشکلاتی وجود دارد

**شرایط unhealthy**:
- `problematicRooms > 0`
- `mainLoopActive === false`
- `syncLoopActive === false`

---

## مثال‌های Scenario

### Scenario 1: سیستم سالم
```json
{
  "isHealthy": true,
  "memoryState": { "totalRooms": 5, "errorRooms": 0 },
  "issues": { "problematicRooms": 0 }
}
```

### Scenario 2: روم با خطا
```json
{
  "isHealthy": false,
  "memoryState": { "totalRooms": 5, "errorRooms": 1 },
  "issues": {
    "problematicRooms": 1,
    "details": [
      {
        "activeRoomId": 3,
        "errorCount": 3,
        "lastError": "Transaction failed"
      }
    ]
  }
}
```

### Scenario 3: Sync عقب افتاده
```json
{
  "isHealthy": false,
  "issues": {
    "outOfSyncRooms": 2,
    "details": [
      {
        "activeRoomId": 1,
        "timeSinceLastSync": 18500
      }
    ]
  }
}
```

---

**تاریخ ایجاد**: 1403/07/09  
**نسخه API**: 1.0.0

