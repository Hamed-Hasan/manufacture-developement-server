const express = require('express');
const { createPaymentIntent, updateOrder } = require('../controllers/orderController');
const router = express.Router();

router.post('/create-payment-intent', createPaymentIntent);
router.patch('/order/:id', updateOrder);

module.exports = router;
