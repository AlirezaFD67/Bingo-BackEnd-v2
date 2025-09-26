# API Documentation: Reservation Room Cards

## Endpoint
`GET /api/reservation/room-cards`

## Description
دریافت همه کارت‌های یک active room به همراه اطلاعات صاحب کارت

## Authentication
- **Required**: Yes
- **Type**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <token>`

## Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `activeRoomId` | number | Yes | شناسه روم فعال | `1` |

## Request Example
```http
GET /api/reservation/room-cards?activeRoomId=1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Response

### Success Response (200 OK)
```json
[
  {
    "cardId": 1,
    "matrix": [
      [5, null, null, 37, null, null, 62, 78, 84],
      [null, 12, 24, 33, 41, 51, null, null, null],
      [null, 14, 27, null, 43, 52, 67, null, null]
    ],
    "owner": {
      "userId": 10,
      "username": "john_doe"
    },
    "activeRoomId": 1,
    "reservedAt": "2024-06-20T12:34:56.789Z"
  },
  {
    "cardId": 2,
    "matrix": [
      [1, 15, 23, 34, 42, 58, 67, 78, 89],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null]
    ],
    "owner": {
      "userId": 15,
      "username": "user_15"
    },
    "activeRoomId": 1,
    "reservedAt": "2024-06-20T12:35:12.456Z"
  }
]
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `cardId` | number | شناسه کارت |
| `matrix` | array | آرایه 2 بعدی اعداد کارت (null برای خانه‌های خالی) |
| `owner.userId` | number | شناسه کاربر صاحب کارت |
| `owner.username` | string | نام کاربری (اگر null باشد، از `user_${userId}` استفاده می‌شود) |
| `activeRoomId` | number | شناسه روم فعال |
| `reservedAt` | string (ISO 8601) | زمان رزرو کارت |

### Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "activeRoomId must be a number",
  "error": "Bad Request"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Active room not found",
  "error": "Not Found"
}
```

## Business Logic

1. **Authentication Check**: بررسی اعتبار JWT token
2. **Parameter Validation**: اعتبارسنجی `activeRoomId` به عنوان عدد
3. **Data Retrieval**: جستجو در جدول `user_reserved_cards` با relations به `cards` و `users`
4. **Data Transformation**: تبدیل داده‌ها به فرمت مطلوب response
5. **Response**: ارسال لیست کارت‌ها با اطلاعات صاحب کارت

## Database Relations

- `user_reserved_cards` → `cards` (ManyToOne)
- `user_reserved_cards` → `users` (ManyToOne)
- `user_reserved_cards` → `active_room_global` (ManyToOne)

## Notes

- API فقط کارت‌های رزرو شده در روم مشخص شده را برمی‌گرداند
- اگر username کاربر null باشد، از `user_${userId}` استفاده می‌شود
- Response همیشه آرایه است، حتی اگر کارتی وجود نداشته باشد (آرایه خالی)
- زمان `reservedAt` از فیلد `createdAt` جدول `user_reserved_cards` گرفته می‌شود

## Related Endpoints

- `POST /api/reservation/reserve` - رزرو کارت در روم
- `GET /api/admin/rooms` - مدیریت روم‌ها (برای ادمین)

## Version
- **Added**: v1.0.0
- **Task ID**: T018
- **Date**: 1403/09/15
