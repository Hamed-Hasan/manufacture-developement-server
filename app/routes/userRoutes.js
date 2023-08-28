const express = require('express');
const { getAllUsers, getUserByEmail, updateUser } = require('../controllers/userController');
const { verifyAdmin } = require('../middleware/adminMiddleware');
const router = express.Router();

router.get('/users', getAllUsers);
router.get('/userInfo/:email', getUserByEmail);
router.put('/newUser/:email', updateUser);

module.exports = router;
