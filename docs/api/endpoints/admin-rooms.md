# API Endpoints - Admin Game Rooms

## Base URL
`/api/admin/rooms`

## Authentication
تمام endpoints نیاز به JWT token دارند و فقط برای ادمین‌ها قابل دسترسی هستند.

## Endpoints

### 1. دریافت لیست اتاق‌های بازی

**GET** `/api/admin/rooms`

#### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| type | number | No | نوع اتاق (1=GLOBAL, 2=PRIVATE) | `?type=1` |
| isActive | boolean | No | وضعیت فعال بودن | `?isActive=true` |

#### Example Request
```bash
curl -X GET 'http://localhost:3006/api/admin/rooms?type=1&isActive=true' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

#### Response
```json
{
  "data": [
    {
      "id": 1,
      "entryFee": 1000,
      "startTimer": 30,
      "isActive": true,
      "type": 1,
      "minPlayers": 2,
      "createdAt": "2025-09-20T06:06:51.851Z"
    }
  ],
  "timestamp": "2025-09-20T07:01:38.954Z",
  "duration": 6
}
```

### 2. دریافت یک اتاق خاص

**GET** `/api/admin/rooms/:id`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | شناسه اتاق |

#### Example Request
```bash
curl -X GET 'http://localhost:3006/api/admin/rooms/1' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

#### Response
```json
{
  "id": 1,
  "entryFee": 1000,
  "startTimer": 30,
  "isActive": true,
  "type": 1,
  "minPlayers": 2,
  "createdAt": "2025-09-20T06:06:51.851Z",
  "timestamp": "2025-09-20T07:01:38.954Z",
  "duration": 6
}
```

### 3. ایجاد اتاق جدید

**POST** `/api/admin/rooms`

#### Request Body
```json
{
  "entryFee": 1000,
  "startTimer": 30,
  "type": 1,
  "minPlayers": 2
}
```

#### Example Request
```bash
curl -X POST 'http://localhost:3006/api/admin/rooms' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "entryFee": 1000,
    "startTimer": 30,
    "type": 1,
    "minPlayers": 2
  }'
```

#### Response
```json
{
  "id": 1,
  "entryFee": 1000,
  "startTimer": 30,
  "isActive": true,
  "type": 1,
  "minPlayers": 2,
  "createdAt": "2025-09-20T06:06:51.851Z",
  "timestamp": "2025-09-20T07:01:38.954Z",
  "duration": 6
}
```

### 4. به‌روزرسانی اتاق

**PUT** `/api/admin/rooms/:id`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | شناسه اتاق |

#### Request Body
```json
{
  "entryFee": 2000,
  "startTimer": 45,
  "type": 2,
  "minPlayers": 4,
  "isActive": false
}
```

#### Example Request
```bash
curl -X PUT 'http://localhost:3006/api/admin/rooms/1' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "entryFee": 2000,
    "startTimer": 45,
    "type": 2,
    "minPlayers": 4
  }'
```

### 5. تغییر وضعیت اتاق

**PUT** `/api/admin/rooms/:id/status`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | شناسه اتاق |

#### Request Body
```json
{
  "isActive": false
}
```

#### Example Request
```bash
curl -X PUT 'http://localhost:3006/api/admin/rooms/1/status' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "isActive": false
  }'
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "داده‌های ورودی معتبر نیستند",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "توکن معتبر نیست یا کاربر ادمین نیست",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "اتاق بازی یافت نشد",
  "error": "Not Found"
}
```

## Data Models

### GameRoomResponseDto
```typescript
{
  id: number;
  entryFee: number;
  startTimer: number;
  isActive: boolean;
  type: RoomType;
  minPlayers: number;
  createdAt: Date;
}
```

### RoomType Enum
```typescript
enum RoomType {
  GLOBAL = 1,  // اتاق عمومی
  PRIVATE = 2  // اتاق خصوصی
}
```
