const express = require('express');
const { register, login, getMe, updateProfile, updatePassword, setupAdminProfile, registerAdmin, registerAdminsBulk, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);
router.post('/setup-admin', protect, setupAdminProfile);
router.post('/register-admin', protect, registerAdmin);
router.post('/register-admin-bulk', protect, registerAdminsBulk);

module.exports = router;
