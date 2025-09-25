# Rooms API Endpoints

## دریافت اطلاعات اتاق فعال

### GET /rooms/:id

دریافت اطلاعات یک اتاق فعال بر اساس شناسه.

#### Parameters
- `id` (number, required): شناسه اتاق فعال


#### Response
```json
{
  "id": 1,
  "status": "pending",
  "startTime": "2024-06-25T18:00:00Z",
  "gameRoom": {
    "id": 1,
    "name": "Room 1",
    "entryFee": 100000,
    "startTimer": 100,
    "isActive": true,
    "createdAt": "2024-03-20T12:00:00Z",
    "createdAtPersian": "1403/01/01",
    "type": 1,
    "minPlayers": 3
  }
}
```

#### Status Codes
- `200`: اطلاعات اتاق فعال با موفقیت دریافت شد
- `404`: اتاق فعال یافت نشد

#### Example Request
```bash
GET /rooms/1
```

#### Example Response
```json
{
  "id": 1,
  "status": "pending",
  "startTime": "2024-06-25T18:00:00Z",
  "gameRoom": {
    "id": 1,
    "name": "Room 1",
    "entryFee": 100000,
    "startTimer": 100,
    "isActive": true,
    "createdAt": "2024-03-20T12:00:00Z",
    "createdAtPersian": "1403/01/01",
    "type": 1,
    "minPlayers": 3
  }
}
```
