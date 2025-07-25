const express = require('express');
const {
  getLostFoundItems,
  getLostFoundItem,
  createLostFoundItem,
  updateLostFoundItem,
  deleteLostFoundItem,
  getLostFoundStats,
  getMyLostFoundItems
} = require('../controllers/lostFoundController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getLostFoundItems);
router.get('/:id', getLostFoundItem);

// Protected routes (require authentication)
router.use(protect); // All routes below require authentication

router.post('/', createLostFoundItem);
router.get('/user/my-items', getMyLostFoundItems);
router.put('/:id', updateLostFoundItem);
router.delete('/:id', deleteLostFoundItem);

// Admin only routes
router.get('/admin/stats', authorize('admin'), getLostFoundStats);

module.exports = router;
