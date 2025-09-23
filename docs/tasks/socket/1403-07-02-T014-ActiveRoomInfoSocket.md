# تسک T014: سوکت Active Room Info

## اطلاعات کلی
- **تاریخ**: 1403/07/02
- **تسک ID**: T014
- **نام**: ActiveRoomInfoSocket
- **توسعه‌دهنده**: AI Assistant

## شرح تسک
پیاده‌سازی سوکت برای دریافت اطلاعات یک روم فعال بر اساس activeRoomId شامل status، remainingSeconds، availableCards و playerCount.

## فایل‌های ایجاد شده

### 1. DTO جدید
- `src/modules/socket/dto/room-info-response.dto.ts` - DTO پاسخ اطلاعات روم

### 2. فایل‌های ویرایش شده
- `src/modules/socket/rooms.service.ts` - اضافه شدن متد `getRoomInfo()`
- `src/modules/socket/rooms.gateway.ts` - اضافه شدن handler برای `roomInfoRequest`
- `src/modules/socket-mock/socket-mock.controller.ts` - اضافه شدن endpoint `/api/socket-test/active-room-info`

## ویژگی‌های پیاده‌سازی شده

### 1. Namespace سوکت
- **Namespace**: `/rooms`
- **پورت**: 3006
- **CORS**: فعال برای همه origins

### 2. Event ها
- **Event ارسال**: `roomInfoRequest`
- **Event دریافت**: `roomInfo`
- **Error Event**: `error`

### 3. ورودی سوکت
```json
{
  "activeRoomId": 1
}
```

### 4. پاسخ سوکت
```json
{
  "status": "started",
  "remainingSeconds": 120,
  "availableCards": 15,
  "playerCount": 5
}
```

## منطق محاسبه availableCards
- حداکثر 30 کارت در هر روم
- `availableCards = 30 - تعداد کارت‌های رزرو شده`
- محاسبه بر اساس `SUM(cardCount)` از جدول `reservations`

## Swagger Documentation

### Endpoint
- **URL**: `GET /api/socket-test/active-room-info`
- **Query Parameter**: `activeRoomId` (required)
- **Type**: `number`
- **Tag**: `Socket Testing`

### نمونه استفاده
```javascript
// دریافت اطلاعات روم با ID 1
GET /api/socket-test/active-room-info?activeRoomId=1
```

## استفاده از سوکت

### اتصال
```javascript
const socket = io('http://localhost:3006/rooms');
```

### درخواست اطلاعات روم
```javascript
socket.emit('roomInfoRequest', { activeRoomId: 1 });
```

### گوش دادن به پاسخ
```javascript
socket.on('roomInfo', (data) => {
  console.log('Room Info:', data);
  // Response: { status: "started", remainingSeconds: 120, availableCards: 15, playerCount: 5 }
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
سوکت Active Room Info با تمام قابلیت‌های مورد نیاز پیاده‌سازی شد و آماده استفاده است.
