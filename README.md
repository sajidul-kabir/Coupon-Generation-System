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
### 2. `coupons`
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
### 3. `coupon_redemptions`

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
1.  GET /coupons
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

2. POST /coupons
Generates a coupon (user-specific or time-specific).

Request Body Example (User-Specific):

```
{
  "type": "user",
  "userId": 1,
  "discount": 20,
  "code" : "ABC1"
}
```
Request Body Example (Time-Specific):

```
{
  "type": "time",
  "discount": 25.5,
  "validFrom": "2025-11-10 00:00:00",
  "validTo": "2025-11-20 23:59:59",
  "maxRedemptions": 100,
  "code" : "TTX1"

}
```
Response:

```
{
  "id": 1,
  "code": "ABC1",
  "type": "USER_SPECIFIC",
  "discount": 20
}
```
3. POST /coupons/validate
Validates a coupon.

Request Body Example (User-Specific):

```
{
  "code": "ABC1",
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
  "message": "Coupon valid",
  "discount": 25.5
}
```
```
{
  "valid": false,
  "message": "Coupon has reached its maximum redemption",
  "discount": 25.5
}
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
│   ├─ config/
|   |   └─ mysqlConfig.js
│   └─ server.js
|   └─ app.js
│
└─ package.json
```
## Validation

- **Used Zod** for request body validation.  
- Ensures required fields exist and have correct types.

---

## Coupon Types

### USER_SPECIFIC
- Linked to a single user.  
- Can be redeemed **once**.

### TIME_SPECIFIC
- Valid within `validFrom` and `validTo`.  
- Can be redeemed **multiple times** by multiple users.  
- Tracks total redemptions of an user via: 
  - `coupon_redemptions` table, then compared with `maxRedemtion` column

---

## Coupon Validation Logic

- Checks **type** (`USER_SPECIFIC` or `TIME_SPECIFIC`).

## For user-specific coupons:
- Validates **user ownership**.  
- Checks **redeemed status**.  

## For time-specific coupons:
- Validates current date against `validFrom` and `validTo`.  
- Checks count of redemtion in `Coupon_redemtion` table and compare against `maxRedemptions` in `coupons` table.
---

## Database Integration

- Used **MySQL** with the `mysql2` Node.js package.  
- Queries are executed via a **repository layer** for separation of concerns.

##  Development Tradeoffs

* **Database Access (Raw SQL):**
    * **Pro:** Fastest way to write queries when familiar with SQL, zero overhead from setting up an ORM.
    * **Con:** High **risk of SQL injection** (if prepared statements are missed) and creates **tight coupling**; schema changes break code in the repository layer.

* **Language Choice (JavaScript):**
    * **Pro:** Eliminates TypeScript setup time and compilation overhead.
    * **Con:** **Lacks compile-time safety**, meaning type-related bugs are only discovered **at runtime**, severely impacting future maintenance and refactoring confidence.

* **Validation (Minimal Zod):**
    * **Pro:** Quickly ensures only required fields are present to fulfill the core API contract.
    * **Con:** **Incomplete input sanitation** for optional fields or complex business rules (e.g., date formats, range checks), pushing error handling into the service layer.

* **Architectural Separation (Tight Coupling):**
    * **Pro:** Simpler code; data can be passed directly from controller to repository.
    * **Con:** **Violates separation of concerns**. Service logic is rigid and harder to reuse outside of the Express route context, making the codebase brittle.

* **Error Handling:**
    * **Pro:** Focuses on simple 400/500 responses to meet the endpoint requirements.
    * **Con:** **Poor Observability** and **inconsistent API response format**. Lacks centralized error middleware for structured logging and helpful, actionable messages for consumers.

* **Coupon Logic (Simplified State Management):**
    * **Pro:** Quickly implements distinct validation paths for `USER_SPECIFIC` (redeemed status) and `TIME_SPECIFIC` (redemption count).
    * **Con:** Potential for **inconsistent state bugs** if the `redeemed` boolean in the `coupons` table isn't maintained correctly across both types, leading to auditing difficulties.

---
