require('dotenv').config();
const { run } = require('./db');

const migrations = [
  `CREATE TABLE IF NOT EXISTS item_master (
    product_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    product_code TEXT    NOT NULL UNIQUE,
    product_name TEXT    NOT NULL,
    category     TEXT,
    unit_of_measure TEXT,
    is_active    INTEGER DEFAULT 1,
    created_at   TEXT    DEFAULT (datetime('now')),
    updated_at   TEXT    DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS sales_master (
    sales_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    financial_year  TEXT    NOT NULL,
    month           TEXT    NOT NULL,
    product_id      INTEGER NOT NULL,
    customer_name   TEXT    NOT NULL,
    sales_quantity  REAL    NOT NULL DEFAULT 0,
    sales_value     REAL    NOT NULL DEFAULT 0,
    unit_of_measure TEXT,
    region          TEXT,
    created_at      TEXT    DEFAULT (datetime('now')),
    updated_at      TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES item_master(product_id) ON DELETE RESTRICT ON UPDATE CASCADE
  )`,

  `CREATE INDEX IF NOT EXISTS idx_sales_financial_year ON sales_master(financial_year)`,
  `CREATE INDEX IF NOT EXISTS idx_sales_month          ON sales_master(month)`,
  `CREATE INDEX IF NOT EXISTS idx_sales_product_id     ON sales_master(product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sales_region         ON sales_master(region)`,
];

(async () => {
  try {
    for (const sql of migrations) {
      await run(sql);
    }
    console.log('Migrations completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
})();
