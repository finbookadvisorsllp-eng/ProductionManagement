require('dotenv').config();
const { run, all } = require('./db');

const products = [
  { product_code: 'PRD-001', product_name: 'Steel Rod 8mm',       category: 'Steel',    unit_of_measure: 'MT' },
  { product_code: 'PRD-002', product_name: 'Steel Rod 12mm',      category: 'Steel',    unit_of_measure: 'MT' },
  { product_code: 'PRD-003', product_name: 'TMT Bar 16mm',        category: 'TMT',      unit_of_measure: 'MT' },
  { product_code: 'PRD-004', product_name: 'TMT Bar 20mm',        category: 'TMT',      unit_of_measure: 'MT' },
  { product_code: 'PRD-005', product_name: 'Wire Rod 5.5mm',      category: 'Wire',     unit_of_measure: 'MT' },
  { product_code: 'PRD-006', product_name: 'Flat Bar 25x5mm',     category: 'Flat',     unit_of_measure: 'MT' },
  { product_code: 'PRD-007', product_name: 'Angle Iron 50x50x5',  category: 'Angle',    unit_of_measure: 'MT' },
  { product_code: 'PRD-008', product_name: 'Channel 100x50mm',    category: 'Channel',  unit_of_measure: 'MT' },
];

const customers = [
  'Apex Constructions Ltd',
  'BuildRight Infrastructure',
  'Metro Steel Traders',
  'National Projects Corp',
  'Sunrise Builders Pvt Ltd',
  'GreenTech Industries',
  'Landmark Developers',
];

const regions = ['North', 'South', 'East', 'West', 'Central'];
const months = ['April', 'May', 'June', 'July', 'August', 'September',
                'October', 'November', 'December', 'January', 'February', 'March'];
const financialYears = ['2022-23', '2023-24', '2024-25'];

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

(async () => {
  try {
    const existing = await all('SELECT COUNT(*) AS cnt FROM item_master');
    if (existing[0].cnt > 0) {
      console.log('Seed data already present. Skipping.');
      process.exit(0);
    }

    for (const p of products) {
      await run(
        `INSERT INTO item_master (product_code, product_name, category, unit_of_measure)
         VALUES (?, ?, ?, ?)`,
        [p.product_code, p.product_name, p.category, p.unit_of_measure]
      );
    }

    const productRows = await all('SELECT product_id, unit_of_measure FROM item_master');

    for (const fy of financialYears) {
      for (const month of months) {
        for (const product of productRows) {
          const numRecords = Math.floor(rand(1, 4));
          for (let i = 0; i < numRecords; i++) {
            const qty   = parseFloat(rand(10, 500).toFixed(2));
            const price = parseFloat(rand(45000, 75000).toFixed(2));
            await run(
              `INSERT INTO sales_master
                (financial_year, month, product_id, customer_name, sales_quantity, sales_value, unit_of_measure, region)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [fy, month, product.product_id, pick(customers), qty, parseFloat((qty * price).toFixed(2)),
               product.unit_of_measure, pick(regions)]
            );
          }
        }
      }
    }

    console.log('Seed data inserted successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
})();
