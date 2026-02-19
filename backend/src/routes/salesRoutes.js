const express = require('express');
const multer  = require('multer');
const router  = express.Router();

const {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  bulkImport,
  getAggregations,
  getFilterOptions,
  downloadTemplate,
} = require('../controllers/salesController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (allowed.includes(file.mimetype) ||
        file.originalname.match(/\.(csv|xlsx|xls)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed.'), false);
    }
  },
});

router.get('/filter-options',  getFilterOptions);
router.get('/aggregations',    getAggregations);
router.get('/template',        downloadTemplate);
router.get('/',                getSales);
router.get('/:id',             getSaleById);
router.post('/',               createSale);
router.put('/:id',             updateSale);
router.delete('/:id',          deleteSale);
router.post('/import/bulk',    upload.single('file'), bulkImport);

module.exports = router;
