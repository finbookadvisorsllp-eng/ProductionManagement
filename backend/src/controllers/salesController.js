const { run, get, all } = require('../database/db');
const asyncHandler = require('../utils/asyncHandler');
const { parseImportFile } = require('../utils/importParser');

const buildFilterClause = (query) => {
  const conditions = [];
  const params = [];

  if (query.financial_year) {
    conditions.push('sm.financial_year = ?');
    params.push(query.financial_year);
  }
  if (query.month) {
    conditions.push('sm.month = ?');
    params.push(query.month);
  }
  if (query.product_id) {
    conditions.push('sm.product_id = ?');
    params.push(parseInt(query.product_id, 10));
  }
  if (query.region) {
    conditions.push('sm.region = ?');
    params.push(query.region);
  }
  if (query.customer_name) {
    conditions.push('sm.customer_name LIKE ?');
    params.push(`%${query.customer_name}%`);
  }

  return {
    clause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
};

const getSales = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page  || 1, 10));
  const limit = Math.min(500, Math.max(1, parseInt(req.query.limit || 50, 10)));
  const offset = (page - 1) * limit;

  const { clause, params } = buildFilterClause(req.query);

  const countRow = await get(
    `SELECT COUNT(*) AS total FROM sales_master sm ${clause}`,
    params
  );

  const rows = await all(
    `SELECT sm.*, im.product_code, im.product_name
     FROM sales_master sm
     LEFT JOIN item_master im ON sm.product_id = im.product_id
     ${clause}
     ORDER BY sm.financial_year DESC, sm.month, sm.sales_id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({
    success: true,
    data: rows,
    pagination: {
      total: countRow.total,
      page,
      limit,
      totalPages: Math.ceil(countRow.total / limit),
    },
  });
});

const getSaleById = asyncHandler(async (req, res) => {
  const row = await get(
    `SELECT sm.*, im.product_code, im.product_name
     FROM sales_master sm
     LEFT JOIN item_master im ON sm.product_id = im.product_id
     WHERE sm.sales_id = ?`,
    [req.params.id]
  );
  if (!row) return res.status(404).json({ success: false, message: 'Record not found.' });
  res.json({ success: true, data: row });
});

const createSale = asyncHandler(async (req, res) => {
  const {
    financial_year, month, product_id, customer_name,
    sales_quantity, sales_value, unit_of_measure, region,
  } = req.body;

  const product = await get('SELECT product_id FROM item_master WHERE product_id = ?', [product_id]);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  const result = await run(
    `INSERT INTO sales_master
      (financial_year, month, product_id, customer_name, sales_quantity, sales_value, unit_of_measure, region)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [financial_year, month, product_id, customer_name, sales_quantity, sales_value, unit_of_measure, region]
  );

  const created = await get('SELECT * FROM sales_master WHERE sales_id = ?', [result.lastID]);
  res.status(201).json({ success: true, data: created });
});

const updateSale = asyncHandler(async (req, res) => {
  const existing = await get('SELECT * FROM sales_master WHERE sales_id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ success: false, message: 'Record not found.' });

  const {
    financial_year, month, product_id, customer_name,
    sales_quantity, sales_value, unit_of_measure, region,
  } = req.body;

  await run(
    `UPDATE sales_master SET
      financial_year  = ?,
      month           = ?,
      product_id      = ?,
      customer_name   = ?,
      sales_quantity  = ?,
      sales_value     = ?,
      unit_of_measure = ?,
      region          = ?,
      updated_at      = datetime('now')
     WHERE sales_id = ?`,
    [financial_year, month, product_id, customer_name,
     sales_quantity, sales_value, unit_of_measure, region, req.params.id]
  );

  const updated = await get('SELECT * FROM sales_master WHERE sales_id = ?', [req.params.id]);
  res.json({ success: true, data: updated });
});

const deleteSale = asyncHandler(async (req, res) => {
  const existing = await get('SELECT * FROM sales_master WHERE sales_id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ success: false, message: 'Record not found.' });

  await run('DELETE FROM sales_master WHERE sales_id = ?', [req.params.id]);
  res.json({ success: true, message: 'Record deleted.' });
});

const bulkImport = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

  const rows = parseImportFile(req.file.buffer, req.file.originalname);

  const productIds = [...new Set(rows.map((r) => r.product_id))];
  const existingProducts = await all(
    `SELECT product_id FROM item_master WHERE product_id IN (${productIds.map(() => '?').join(',')})`,
    productIds
  );
  const validProductIds = new Set(existingProducts.map((p) => p.product_id));
  const invalidProducts = productIds.filter((id) => !validProductIds.has(id));

  if (invalidProducts.length > 0) {
    return res.status(422).json({
      success: false,
      message: `Invalid product_id(s): ${invalidProducts.join(', ')}. These products do not exist in item_master.`,
    });
  }

  let inserted = 0;
  for (const row of rows) {
    await run(
      `INSERT INTO sales_master
        (financial_year, month, product_id, customer_name, sales_quantity, sales_value, unit_of_measure, region)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [row.financial_year, row.month, row.product_id, row.customer_name,
       row.sales_quantity, row.sales_value, row.unit_of_measure, row.region]
    );
    inserted++;
  }

  res.status(201).json({
    success: true,
    message: `Successfully imported ${inserted} record(s).`,
    inserted,
  });
});

const getAggregations = asyncHandler(async (req, res) => {
  const { financial_year, product_id } = req.query;
  const params = [];
  const conditions = [];

  if (financial_year) { conditions.push('sm.financial_year = ?'); params.push(financial_year); }
  if (product_id)     { conditions.push('sm.product_id = ?');     params.push(parseInt(product_id, 10)); }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const yearlyTotal = await all(
    `SELECT
       sm.financial_year,
       sm.product_id,
       im.product_code,
       im.product_name,
       im.unit_of_measure,
       ROUND(SUM(sm.sales_quantity), 2) AS total_quantity,
       ROUND(SUM(sm.sales_value), 2)    AS total_value,
       COUNT(DISTINCT sm.customer_name) AS unique_customers,
       COUNT(sm.sales_id)               AS transaction_count
     FROM sales_master sm
     LEFT JOIN item_master im ON sm.product_id = im.product_id
     ${whereClause}
     GROUP BY sm.financial_year, sm.product_id
     ORDER BY sm.financial_year DESC, total_value DESC`,
    params
  );

  const monthlyAvg = await all(
    `SELECT
       sm.financial_year,
       sm.month,
       sm.product_id,
       im.product_code,
       im.product_name,
       ROUND(AVG(sm.sales_quantity), 2) AS avg_monthly_quantity,
       ROUND(AVG(sm.sales_value), 2)    AS avg_monthly_value,
       ROUND(SUM(sm.sales_quantity), 2) AS total_quantity,
       ROUND(SUM(sm.sales_value), 2)    AS total_value
     FROM sales_master sm
     LEFT JOIN item_master im ON sm.product_id = im.product_id
     ${whereClause}
     GROUP BY sm.financial_year, sm.month, sm.product_id
     ORDER BY sm.financial_year DESC, sm.month, sm.product_id`,
    params
  );

  const regionBreakdown = await all(
    `SELECT
       sm.region,
       ROUND(SUM(sm.sales_quantity), 2) AS total_quantity,
       ROUND(SUM(sm.sales_value), 2)    AS total_value,
       COUNT(sm.sales_id)               AS transaction_count
     FROM sales_master sm
     ${whereClause}
     GROUP BY sm.region
     ORDER BY total_value DESC`,
    params
  );

  res.json({
    success: true,
    data: {
      yearly_totals:     yearlyTotal,
      monthly_averages:  monthlyAvg,
      region_breakdown:  regionBreakdown,
    },
  });
});

const getFilterOptions = asyncHandler(async (req, res) => {
  const [years, months, products, regions] = await Promise.all([
    all('SELECT DISTINCT financial_year FROM sales_master ORDER BY financial_year DESC'),
    all('SELECT DISTINCT month FROM sales_master ORDER BY month'),
    all('SELECT product_id, product_code, product_name FROM item_master WHERE is_active = 1 ORDER BY product_name'),
    all('SELECT DISTINCT region FROM sales_master WHERE region != \'\' ORDER BY region'),
  ]);

  res.json({
    success: true,
    data: {
      financial_years: years.map((r) => r.financial_year),
      months:          months.map((r) => r.month),
      products,
      regions:         regions.map((r) => r.region),
    },
  });
});

const downloadTemplate = asyncHandler(async (req, res) => {
  const XLSX = require('xlsx');
  const products = await all('SELECT product_id, product_code, product_name FROM item_master WHERE is_active = 1 ORDER BY product_id');

  const templateData = [
    {
      financial_year: '2024-25',
      month: 'April',
      product_id: products[0]?.product_id || 1,
      customer_name: 'Sample Customer Ltd',
      sales_quantity: 100,
      sales_value: 5000000,
      unit_of_measure: 'MT',
      region: 'North',
    },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(templateData);

  const productInfo = XLSX.utils.aoa_to_sheet([
    ['product_id', 'product_code', 'product_name'],
    ...products.map((p) => [p.product_id, p.product_code, p.product_name]),
  ]);

  XLSX.utils.book_append_sheet(wb, ws, 'Sales Data');
  XLSX.utils.book_append_sheet(wb, productInfo, 'Product Reference');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="sales_import_template.xlsx"');
  res.send(buffer);
});

module.exports = {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  bulkImport,
  getAggregations,
  getFilterOptions,
  downloadTemplate,
};
