# Production Management System — Sales Data Module

A full-stack web application for managing historical sales data to support production forecasting.

## Architecture

```
project/
├── backend/          # Node.js + Express REST API (SQLite)
│   └── src/
│       ├── database/ # SQLite DB, migrations, seed
│       ├── routes/   # Express routers
│       ├── controllers/
│       ├── middleware/
│       └── utils/
└── frontend/         # React + Vite SPA
    └── src/
        ├── components/
        ├── pages/
        ├── services/ # API client
        └── hooks/
```

## Database Schema

### `item_master` (Products)
| Column | Type | Notes |
|---|---|---|
| product_id | INTEGER PK | Auto-increment |
| product_code | TEXT | Unique |
| product_name | TEXT | |
| category | TEXT | |
| unit_of_measure | TEXT | |
| is_active | INTEGER | Default 1 |

### `sales_master` (Sales Data)
| Column | Type | Notes |
|---|---|---|
| sales_id | INTEGER PK | Auto-increment |
| financial_year | TEXT | e.g. 2024-25 |
| month | TEXT | e.g. April |
| product_id | INTEGER FK | → item_master |
| customer_name | TEXT | |
| sales_quantity | REAL | |
| sales_value | REAL | |
| unit_of_measure | TEXT | |
| region | TEXT | |
| created_at | TEXT | |
| updated_at | TEXT | |

## REST API Endpoints

### Sales
| Method | URL | Description |
|---|---|---|
| GET | `/api/sales` | List with filters + pagination |
| GET | `/api/sales/:id` | Single record |
| POST | `/api/sales` | Create record |
| PUT | `/api/sales/:id` | Update record |
| DELETE | `/api/sales/:id` | Delete record |
| POST | `/api/sales/import/bulk` | CSV/Excel bulk import |
| GET | `/api/sales/aggregations` | Yearly totals + monthly averages |
| GET | `/api/sales/filter-options` | Dropdown values |
| GET | `/api/sales/template` | Download Excel template |

### Items
| Method | URL | Description |
|---|---|---|
| GET | `/api/items` | All products |
| POST | `/api/items` | Create product |
| PUT | `/api/items/:id` | Update product |

## Filter Parameters (`GET /api/sales`)

| Parameter | Description |
|---|---|
| `financial_year` | Filter by FY (e.g. `2024-25`) |
| `month` | Filter by month (e.g. `April`) |
| `product_id` | Filter by product |
| `region` | Filter by region |
| `customer_name` | Partial text search |
| `page` | Page number (default 1) |
| `limit` | Records per page (default 50, max 500) |

## Aggregation Queries (`GET /api/sales/aggregations`)

Returns three result sets:
1. **yearly_totals** — total qty, value, unique customers per product per FY
2. **monthly_averages** — avg monthly qty & value per product per month per FY
3. **region_breakdown** — totals grouped by region

## Bulk Import Format

Headers (row 1):
```
financial_year, month, product_id, customer_name, sales_quantity, sales_value, unit_of_measure, region
```

## Setup

```bash
# Install all dependencies, run migrations and seed data
npm run setup

# Start backend (port 5000)
npm run backend

# Start frontend (port 3000)
npm run frontend
```

## Frontend Pages

| Route | Description |
|---|---|
| `/sales/dashboard` | KPI cards + trend charts |
| `/sales/records` | Filterable data table with CRUD |
| `/sales/import` | CSV/Excel bulk import with dropzone |
| `/sales/analytics` | Yearly totals, monthly averages, region breakdown |
