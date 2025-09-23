# Reservation Reserve API

## Endpoint
- **Method**: POST
- **URL**: `/api/reservation/reserve`
- **Authentication**: JWT Bearer Token Required

## Description
رزرو کارت برای ورود به بازی بینگو

## Request Body
```json
{
  "activeRoomId": 1,
  "cardCount": 2
}
```

### Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| activeRoomId | number | Yes | شناسه اتاق فعال (active_room_global.id) |
| cardCount | number | Yes | تعداد کارت‌های رزرو شده |

## Response

### Success (200)
```json
{
  "id": 123
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid user"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Active room not found"
}
```

```json
{
  "statusCode": 404,
  "message": "Game room not found"
}
```

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Room is not pending"
}
```

## Business Logic
1. بررسی وجود کاربر معتبر
2. بررسی وجود `active_room_global` با شناسه داده‌شده
3. بررسی وضعیت روم (باید `pending` باشد)
4. دریافت `entryFee` از `game_rooms` مرتبط
5. ایجاد رکورد جدید در جدول `reservations`
6. امکان عضویت همزمان در چند روم

## Notes
- کاربر می‌تواند همزمان در چند روم عضو باشد
- فقط روم‌های با وضعیت `pending` قابل رزرو هستند

