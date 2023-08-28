const express = require('express');
const { getAllProducts, getProductById } = require('../controllers/productController');
const router = express.Router();

router.get('/product', getAllProducts);
router.get('/product/:id', getProductById);

module.exports = router;
