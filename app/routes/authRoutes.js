const express = require('express');
const { verifyJWT } = require('../controllers/authController');
const router = express.Router();

router.use(verifyJWT);

module.exports = router;
