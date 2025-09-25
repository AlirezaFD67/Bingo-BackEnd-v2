# Wallet Withdraw API Endpoints

## Overview
API endpoints for wallet withdrawal functionality including user withdrawal requests and admin approval/rejection.

## User Endpoints

### POST /api/wallet/withdraw
Request withdrawal from user's wallet.

**Authentication:** Required (JWT)
**Authorization:** User role

#### Request Body
```json
{
  "amount": 50000
}
```

#### Request Parameters
- `amount` (number, required): Withdrawal amount in Rials
  - Must be positive
  - Must not exceed wallet balance

#### Response (201 Created)
```json
{
  "id": 2,
  "userId": 2,
  "amount": -50000,
  "type": "withdraw",
  "status": "pending",
  "createdAt": "2024-06-20T12:35:56.789Z"
}
```

#### Error Responses
- `400 Bad Request`: Invalid amount or insufficient balance
- `401 Unauthorized`: Invalid or missing JWT token
- `404 Not Found`: User not found

## Admin Endpoints

### POST /api/admin/wallet/withdraw/confirm/{txId}
Confirm a withdrawal request by admin.

**Authentication:** Required (JWT)
**Authorization:** Admin role

#### Path Parameters
- `txId` (number, required): Transaction ID

#### Response (200 OK)
```json
{
  "id": 1,
  "userId": 2,
  "amount": -50000,
  "type": "withdraw",
  "status": "confirmed",
  "createdAt": "2024-06-20T12:34:56.789Z"
}
```

#### Error Responses
- `400 Bad Request`: Transaction cannot be confirmed
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Transaction not found

### POST /api/admin/wallet/withdraw/reject/{txId}
Reject a withdrawal request by admin and return amount to user's wallet.

**Authentication:** Required (JWT)
**Authorization:** Admin role

#### Path Parameters
- `txId` (number, required): Transaction ID

#### Response (200 OK)
```json
{
  "id": 1,
  "userId": 2,
  "amount": -50000,
  "type": "withdraw",
  "status": "failed",
  "createdAt": "2024-06-20T12:34:56.789Z"
}
```

#### Error Responses
- `400 Bad Request`: Transaction cannot be rejected
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Transaction not found

## Business Logic

### Withdrawal Process
1. User requests withdrawal with amount
2. System checks if user has sufficient balance
3. If sufficient:
   - Creates transaction with `pending` status
   - Deducts amount from user's wallet balance
   - Stores transaction with negative amount
4. If insufficient: Returns error

### Admin Confirmation
1. Admin confirms withdrawal request
2. Transaction status changes to `confirmed`
3. Amount remains deducted from user's wallet

### Admin Rejection
1. Admin rejects withdrawal request
2. Transaction status changes to `failed`
3. Amount is returned to user's wallet balance

## Data Models

### WithdrawWalletDto
```typescript
{
  amount: number; // Positive number, required
}
```

### WithdrawWalletResponseDto
```typescript
{
  id: number;
  userId: number;
  amount: number; // Negative for withdrawals
  type: "withdraw";
  status: "pending" | "confirmed" | "failed";
  createdAt: Date;
}
```

## Transaction Types
- `withdraw`: Withdrawal transaction

## Transaction Statuses
- `pending`: Awaiting admin approval
- `confirmed`: Approved by admin
- `failed`: Rejected by admin (amount returned to wallet)
