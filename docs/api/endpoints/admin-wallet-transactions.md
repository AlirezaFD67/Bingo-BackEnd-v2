# Admin Wallet Transactions API

## Overview
API برای مدیریت و مشاهده تراکنش‌های کیف پول کاربران توسط ادمین.

## Endpoints

### GET /api/admin/wallet/transactions
دریافت لیست تراکنش‌های کیف پول با قابلیت فیلتر

#### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| type | string | No | فیلتر بر اساس نوع تراکنش | deposit |

#### Transaction Types
- `deposit` - واریز وجه
- `withdraw` - برداشت وجه
- `prize` - جایزه
- `referral_bonus` - پاداش معرفی
- `game_fee` - هزینه بازی
- `bingo_line` - برد خطی بازی
- `bingo_full_card` - برد کارت کامل
- `wheel_spin` - برد گردونه

#### Response
```json
{
  "data": [
    {
      "id": 1,
      "userId": 123,
      "amount": 10000,
      "type": "deposit",
      "status": "confirmed",
      "description": "Deposit via bank transfer",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "duration": 14
}
```

#### Status Codes
- `200` - موفق
- `401` - Unauthorized (توکن نامعتبر)
- `403` - Forbidden (دسترسی غیرمجاز)

#### Example Request
```bash
curl -X GET \
  'http://localhost:3006/api/admin/wallet/transactions?type=deposit' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

#### Example Response
```json
{
  "data": [
    {
      "id": 1,
      "userId": 7,
      "amount": 20000,
      "type": "deposit",
      "status": "confirmed",
      "description": "Initial deposit",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "duration": 14
}
```

## Authentication
این API نیاز به احراز هویت JWT دارد و فقط کاربران با نقش ADMIN می‌توانند به آن دسترسی داشته باشند.

## Error Handling
- در صورت عدم احراز هویت: `401 Unauthorized`
- در صورت عدم دسترسی: `403 Forbidden`
- در صورت خطای سرور: `500 Internal Server Error`
