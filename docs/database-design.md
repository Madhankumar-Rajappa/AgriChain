# AgriChain Database Schema Design

The AgriChain platform relies on MySQL 8+ for relational integrity and transactional safety.

## Entities Summary

1. `users`: System users across 5 roles (FARMER, BUYER, TRANSPORTER, WAREHOUSE_MANAGER, ADMIN).
2. `crops`: Crop listings published by farmers.
3. `orders`: Crop purchases placed by buyers.
4. `payments`: Mock payment records bound to orders.
5. `warehouses`: Warehouse facilities managed by warehouse managers.
6. `storage_requests`: Requests for storing crops/orders in warehouses.
7. `transport_assignments`: Logistics and delivery records assigned to transporters.
8. `market_prices`: Agricultural market prices maintained by admins.
9. `notifications`: In-app notification messages.
10. `audit_logs`: Platform activity and security trail.

## ER Diagram Overview

```
[users] (1) <--- (N) [crops] (1) <--- (N) [orders] (1) <--- (1) [payments]
   ^                                          |
   |                                          +---> (1) [storage_requests] ---> (1) [warehouses]
   |                                          |
   +------------------------------------------+---> (1) [transport_assignments]
```
