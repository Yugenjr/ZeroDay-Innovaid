const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
