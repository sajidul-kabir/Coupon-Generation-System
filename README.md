# Coupon Generation & Validation System

This project implements a robust coupon system with **user-specific** and **time-specific** coupons using **Node.js**, **Express**, **MySQL**, and **Zod** for validation.

---

## Database Tables

### 1. `users`

Stores registered users.

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
2. `coupons`
3. 
Stores coupons with two types: USER_SPECIFIC and TIME_SPECIFIC.

```sql
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('USER_SPECIFIC', 'TIME_SPECIFIC') NOT NULL,
    userId INT NULL,
    discount DECIMAL(10, 2) NOT NULL,
    redeemed BOOLEAN DEFAULT 0,
    validFrom DATETIME NULL,
    validTo DATETIME NULL,
    maxRedemptions INT DEFAULT 1,
    redemptions INT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);
```
3. `coupon_redemptions`
4. 
Tracks coupon usage for auditing.


```sql
CREATE TABLE coupon_redemptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    couponId INT NOT NULL,
    userId INT NULL,
    redeemedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (couponId) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);
```

API Endpoints
1. POST /coupons/generate
Generates a coupon (user-specific or time-specific).

Request Body Example (User-Specific):

```{
  "type": "user",
  "userId": 1,
  "discount": 20
}
```
Request Body Example (Time-Specific):

```{
  "type": "time",
  "discount": 25.5,
  "validFrom": "2025-11-10 00:00:00",
  "validTo": "2025-11-20 23:59:59",
  "maxRedemptions": 100
}
```
Response:

```{
  "id": 1,
  "code": "TTLX",
  "type": "USER_SPECIFIC",
  "discount": 20
}
```
2. POST /coupons/validate
Validates a coupon.

Request Body Example (User-Specific):

```
{
  "code": "TTLX",
  "userId": 1
}
```
Request Body Example (Time-Specific):

```
{
  "code": "TTLX",
  "userId": 2
}
```
Response:

```
{
  "valid": true,
  "message": "Coupon applied successfully",
  "discount": 25.5
}
```
3. GET /coupons
Lists all coupons.

Response Example:
```
[
  {
    "id": 1,
    "code": "TTLX",
    "type": "USER_SPECIFIC",
    "userId": 1,
    "discount": 20,
    "redeemed": false,
    "createdAt": "2025-11-09 12:00:00"
  }
]
```
Implementation Details
Project Structure

```
project/
│
├─ src/
│   ├─ controllers/
│   │   └─ couponController.js
│   ├─ services/
│   │   └─ couponService.js
│   ├─ repositories/
│   │   └─ couponRepository.js
│   ├─ db.js
│   └─ server.js
│
└─ package.json
```
# Validation

- **Used Zod** for request body validation.  
- Ensures required fields exist and have correct types.

---

# Coupon Types

## USER_SPECIFIC
- Linked to a single user.  
- Can be redeemed **once**.

## TIME_SPECIFIC
- Valid within `validFrom` and `validTo`.  
- Can be redeemed **multiple times** by multiple users.  
- Tracks total redemptions via:
  - `redemptions` column  
  - `coupon_redemptions` table  

---

# Coupon Validation Logic

- Checks **type** (`USER_SPECIFIC` or `TIME_SPECIFIC`).

## For user-specific coupons:
- Validates **user ownership**.  
- Checks **redeemed status**.  
- Marks coupon as **redeemed** after successful validation.

## For time-specific coupons:
- Validates current date against `validFrom` and `validTo`.  
- Checks count of redemtion in `Coupon_redemtion` table and compare against `maxRedemptions` in `coupons` table.
- 
---

# Database Integration

- Used **MySQL** with the `mysql2` Node.js package.  
- Queries are executed via a **repository layer** for separation of concerns.

---
