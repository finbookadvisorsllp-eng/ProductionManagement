const { run, get, all } = require('../database/db');
const asyncHandler = require('../utils/asyncHandler');

const getItems = asyncHandler(async (req, res) => {
  const rows = await all(
    `SELECT * FROM item_master ORDER BY product_name`
  );
  res.json({ success: true, data: rows });
});

const getItemById = asyncHandler(async (req, res) => {
  const row = await get('SELECT * FROM item_master WHERE product_id = ?', [req.params.id]);
  if (!row) return res.status(404).json({ success: false, message: 'Product not found.' });
  res.json({ success: true, data: row });
});

const createItem = asyncHandler(async (req, res) => {
  const { product_code, product_name, category, unit_of_measure } = req.body;
  const result = await run(
    `INSERT INTO item_master (product_code, product_name, category, unit_of_measure)
     VALUES (?, ?, ?, ?)`,
    [product_code, product_name, category, unit_of_measure]
  );
  const created = await get('SELECT * FROM item_master WHERE product_id = ?', [result.lastID]);
  res.status(201).json({ success: true, data: created });
});

const updateItem = asyncHandler(async (req, res) => {
  const existing = await get('SELECT * FROM item_master WHERE product_id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ success: false, message: 'Product not found.' });

  const { product_code, product_name, category, unit_of_measure, is_active } = req.body;
  await run(
    `UPDATE item_master SET
      product_code    = ?,
      product_name    = ?,
      category        = ?,
      unit_of_measure = ?,
      is_active       = ?,
      updated_at      = datetime('now')
     WHERE product_id = ?`,
    [product_code, product_name, category, unit_of_measure, is_active ?? existing.is_active, req.params.id]
  );
  const updated = await get('SELECT * FROM item_master WHERE product_id = ?', [req.params.id]);
  res.json({ success: true, data: updated });
});

module.exports = { getItems, getItemById, createItem, updateItem };
