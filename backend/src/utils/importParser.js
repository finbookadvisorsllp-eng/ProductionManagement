const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');
const path = require('path');

const REQUIRED_FIELDS = [
  'financial_year',
  'month',
  'product_id',
  'customer_name',
  'sales_quantity',
  'sales_value',
];

const normalizeRow = (row) => ({
  financial_year:  String(row.financial_year  || row['Financial Year']  || '').trim(),
  month:           String(row.month           || row['Month']           || '').trim(),
  product_id:      parseInt(row.product_id    || row['Product ID']      || 0, 10),
  customer_name:   String(row.customer_name   || row['Customer Name']   || '').trim(),
  sales_quantity:  parseFloat(row.sales_quantity || row['Sales Quantity'] || 0),
  sales_value:     parseFloat(row.sales_value    || row['Sales Value']    || 0),
  unit_of_measure: String(row.unit_of_measure || row['Unit of Measure'] || '').trim(),
  region:          String(row.region          || row['Region']          || '').trim(),
});

const validateRow = (row, index) => {
  const errors = [];
  if (!row.financial_year) errors.push(`Row ${index + 1}: financial_year is required`);
  if (!row.month)          errors.push(`Row ${index + 1}: month is required`);
  if (!row.product_id)     errors.push(`Row ${index + 1}: product_id is required`);
  if (!row.customer_name)  errors.push(`Row ${index + 1}: customer_name is required`);
  if (isNaN(row.sales_quantity) || row.sales_quantity < 0)
    errors.push(`Row ${index + 1}: sales_quantity must be a non-negative number`);
  if (isNaN(row.sales_value) || row.sales_value < 0)
    errors.push(`Row ${index + 1}: sales_value must be a non-negative number`);
  return errors;
};

const parseCSV = (buffer) => {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  return records;
};

const parseExcel = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet, { defval: '' });
};

const parseImportFile = (fileBuffer, originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  let rawRows;

  if (ext === '.csv') {
    rawRows = parseCSV(fileBuffer);
  } else if (['.xlsx', '.xls'].includes(ext)) {
    rawRows = parseExcel(fileBuffer);
  } else {
    throw new Error('Unsupported file format. Use CSV or Excel (.xlsx/.xls).');
  }

  if (!rawRows.length) throw new Error('File is empty or has no data rows.');

  const rows = rawRows.map(normalizeRow);
  const allErrors = [];
  rows.forEach((row, i) => {
    const errs = validateRow(row, i);
    allErrors.push(...errs);
  });

  if (allErrors.length > 0) {
    const err = new Error('Validation errors in import file.');
    err.validationErrors = allErrors;
    err.status = 422;
    throw err;
  }

  return rows;
};

module.exports = { parseImportFile };
