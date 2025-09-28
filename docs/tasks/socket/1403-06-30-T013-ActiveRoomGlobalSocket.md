# تسک T013: سوکت Active Room Global

## اطلاعات کلی
- **تاریخ**: 1403/06/30
- **تسک ID**: T013
- **نام**: ActiveRoomGlobalSocket
- **توسعه‌دهنده**: AI Assistant

## شرح تسک
پیاده‌سازی سوکت برای مدیریت active room global با قابلیت فیلتر بر اساس status (pending/started).

## فایل‌های ایجاد شده

### 1. سوکت
- `src/modules/socket/rooms.gateway.ts` - Gateway سوکت
- `src/modules/socket/rooms.service.ts` - سرویس سوکت
- `src/modules/socket/socket.module.ts` - ماژول سوکت
- `src/modules/socket/dto/pending-rooms-response.dto.ts` - DTO پاسخ

### 2. Mock برای Swagger
- `src/modules/socket-mock/socket-mock.controller.ts` - کنترلر mock
- `src/modules/socket-mock/socket-mock.service.ts` - سرویس mock
- `src/modules/socket-mock/socket-mock.module.ts` - ماژول mock
- `src/modules/socket-mock/dto/pending-rooms-mock.dto.ts` - DTO mock

## ویژگی‌های پیاده‌سازی شده

### 1. Namespace سوکت
- **Namespace**: `/rooms`
- **پورت**: 3006
- **CORS**: فعال برای همه origins

### 2. Event ها
- **Event ارسال**: `activeRoomGlobalRequest`
- **Event دریافت**: `activeRoomGlobal`
- **Error Event**: `error`

### 3. فیلترها
- **همه rooms**: `null` یا `{}`
- **Pending rooms**: `{ status: 'pending' }`
- **Started rooms**: `{ status: 'started' }`

### 4. پاسخ سوکت
```json
{
  "rooms": [
    {
      "activeRoomId": 1,
      "gameRoomId": 1,
      "remainingSeconds": 80,
      "playerCount": 3,
      "entryFee": 100000,
      "status": "pending",
      "minPlayers": 3
    }
  ]
}
```

**نکته**: لیست اتاق‌ها بر اساس `entryFee` از کم به زیاد مرتب‌سازی می‌شود.

## تغییرات انجام شده

### 1. تغییر نام فیلد
- `startTime` → `remainingSeconds` در:
  - Migration: `1700000000003-CreateGlobalActiveRoomTable.ts`
  - Entity: `active-room-global.entity.ts`
  - Service: `auto-timer.service.ts`
  - Tests: `auto-timer.service.spec.ts`

### 2. ماژول‌ها
- اضافه شدن `SocketModule` به `AppModule`
- اضافه شدن `SocketMockModule` به `AppModule`

## Swagger Documentation

### Endpoint
- **URL**: `GET /api/socket-test/active-room-global`
- **Query Parameter**: `status` (optional)
- **Values**: `pending` یا `started`
- **Tag**: `Socket Testing`

### نمونه استفاده
```javascript
// همه rooms
GET /api/socket-test/active-room-global

// فقط pending rooms
GET /api/socket-test/active-room-global?status=pending

// فقط started rooms
GET /api/socket-test/active-room-global?status=started
```

## استفاده از سوکت

### اتصال
```javascript
const socket = io('http://localhost:3006/rooms');
```

### درخواست rooms
```javascript
// همه rooms
socket.emit('activeRoomGlobalRequest', null);

// فقط pending rooms
socket.emit('activeRoomGlobalRequest', { status: 'pending' });

// فقط started rooms
socket.emit('activeRoomGlobalRequest', { status: 'started' });
```

### گوش دادن به پاسخ
```javascript
socket.on('activeRoomGlobal', (data) => {
  console.log('Active room global:', data.rooms);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

## تست‌ها
- Build موفق پروژه
- عدم وجود lint errors
- آماده برای تست runtime

## نتیجه
سوکت Active Room Global با تمام قابلیت‌های مورد نیاز پیاده‌سازی شد و آماده استفاده است.
