# AgriChain System Architecture

## Overview

AgriChain follows a clean, decoupled monorepo architecture with a FastAPI RESTful backend service and a Vite-powered React single page application (SPA) frontend, backed by MySQL 8+.

```
+-------------------------------------------------------+
|                 React / Vite Frontend                 |
|             (SPA + Tailwind CSS + Axios)             |
+-------------------------------------------------------+
                           |
                     HTTP / REST API
                           |
+-------------------------------------------------------+
|                   FastAPI Backend                     |
|  +-------------------------------------------------+  |
|  | Routers (Auth, Crops, Orders, Warehouse, etc.)  |  |
|  +-------------------------------------------------+  |
|  | Business Services & Authorization Dependencies  |  |
|  +-------------------------------------------------+  |
|  | SQLAlchemy 2.0 ORM Engine & Pydantic Validation |  |
|  +-------------------------------------------------+  |
+-------------------------------------------------------+
                           |
                      PyMySQL Driver
                           |
+-------------------------------------------------------+
|                    MySQL 8+ Database                  |
+-------------------------------------------------------+
```

## Key Architectural Principles

1. **Modular Clean Architecture**: Separates routing (`app/api`), core config (`app/core`), database initialization (`app/db`), ORM models (`app/models`), Pydantic schemas (`app/schemas`), and business services (`app/services`).
2. **Type Safety & Validation**: Pydantic v2 schemas strictly validate incoming request payloads and format API responses.
3. **Database Integrity**: SQLAlchemy 2.0 with PyMySQL handles transactions, foreign keys, and Alembic migrations.
4. **Role-Based Access Control (RBAC)**: Centralized JWT dependency enforcing fine-grained user role permissions (`FARMER`, `BUYER`, `TRANSPORTER`, `WAREHOUSE_MANAGER`, `ADMIN`).
