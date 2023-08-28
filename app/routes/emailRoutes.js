const express = require('express');
const { verifyJWT } = require('../middleware/authMiddleware');
const { sendOrderEmail } = require('../controllers/emailController');
const router = express.Router();

router.post('/send-order-email', verifyJWT, sendOrderEmail);

module.exports = router;
