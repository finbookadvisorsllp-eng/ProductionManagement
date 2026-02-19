const express = require('express');
const router  = express.Router();
const { getItems, getItemById, createItem, updateItem } = require('../controllers/itemController');

router.get('/',      getItems);
router.get('/:id',   getItemById);
router.post('/',     createItem);
router.put('/:id',   updateItem);

module.exports = router;
