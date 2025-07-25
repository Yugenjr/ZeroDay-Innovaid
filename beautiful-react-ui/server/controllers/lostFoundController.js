const LostFoundItem = require('../models/LostFoundItem');
const User = require('../models/User');

// @desc    Get all lost and found items with filtering
// @route   GET /api/lostfound
// @access  Public
const getLostFoundItems = async (req, res) => {
  try {
    const {
      type,
      category,
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (type && type !== 'all') filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    
    // Text search across multiple fields
    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with population
    const items = await LostFoundItem.find(filter)
      .populate('reportedBy', 'name email studentId department')
      .populate('claimedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await LostFoundItem.countDocuments(filter);

    res.json({
      success: true,
      data: items,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get lost found items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching items',
      error: error.message
    });
  }
};

// @desc    Get single lost and found item
// @route   GET /api/lostfound/:id
// @access  Public
const getLostFoundItem = async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id)
      .populate('reportedBy', 'name email studentId department phone')
      .populate('claimedBy', 'name email');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Increment view count
    await item.incrementViewCount();

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get lost found item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching item',
      error: error.message
    });
  }
};

// @desc    Create new lost and found item
// @route   POST /api/lostfound
// @access  Private
const createLostFoundItem = async (req, res) => {
  try {
    const {
      type,
      itemName,
      category,
      location,
      description,
      images,
      tags,
      priority
    } = req.body;

    // Get user info
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create item
    const item = await LostFoundItem.create({
      type,
      itemName,
      category,
      location,
      description,
      reportedBy: user._id,
      reportedByName: user.name,
      contactInfo: {
        email: user.email,
        phone: user.phone
      },
      images: images || [],
      tags: tags || [],
      priority: priority || 'medium'
    });

    // Populate the created item
    const populatedItem = await LostFoundItem.findById(item._id)
      .populate('reportedBy', 'name email studentId department');

    // Emit real-time notification to admin
    if (req.io) {
      req.io.emit('newLostFoundItem', {
        item: populatedItem,
        message: `New ${type} item reported: ${itemName}`
      });
    }

    res.status(201).json({
      success: true,
      data: populatedItem,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} item reported successfully`
    });
  } catch (error) {
    console.error('Create lost found item error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating item',
      error: error.message
    });
  }
};

// @desc    Update lost and found item
// @route   PUT /api/lostfound/:id
// @access  Private
const updateLostFoundItem = async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if user owns the item or is admin
    if (item.reportedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    const allowedUpdates = ['itemName', 'category', 'location', 'description', 'images', 'tags', 'priority'];
    const adminOnlyUpdates = ['status', 'adminNotes', 'claimedBy'];

    // Filter updates based on user role
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      } else if (req.user.role === 'admin' && adminOnlyUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedItem = await LostFoundItem.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('reportedBy', 'name email studentId department')
     .populate('claimedBy', 'name email');

    // Emit real-time notification
    if (req.io && updates.status) {
      req.io.emit('lostFoundItemUpdated', {
        item: updatedItem,
        message: `Item status updated to ${updates.status}`
      });
    }

    res.json({
      success: true,
      data: updatedItem,
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('Update lost found item error:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating item',
      error: error.message
    });
  }
};

// @desc    Delete lost and found item
// @route   DELETE /api/lostfound/:id
// @access  Private
const deleteLostFoundItem = async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if user owns the item or is admin
    if (item.reportedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }

    await LostFoundItem.findByIdAndDelete(req.params.id);

    // Emit real-time notification
    if (req.io) {
      req.io.emit('lostFoundItemDeleted', {
        itemId: req.params.id,
        message: 'Item has been removed'
      });
    }

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete lost found item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting item',
      error: error.message
    });
  }
};

// @desc    Get lost and found statistics
// @route   GET /api/lostfound/stats
// @access  Private (Admin only)
const getLostFoundStats = async (req, res) => {
  try {
    const stats = await LostFoundItem.getStats();
    
    res.json({
      success: true,
      data: stats[0] || {
        total: 0,
        lost: 0,
        found: 0,
        pending: 0,
        resolved: 0
      }
    });
  } catch (error) {
    console.error('Get lost found stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics',
      error: error.message
    });
  }
};

// @desc    Get user's lost and found items
// @route   GET /api/lostfound/my-items
// @access  Private
const getMyLostFoundItems = async (req, res) => {
  try {
    const items = await LostFoundItem.find({ reportedBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate('claimedBy', 'name email');

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Get my lost found items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your items',
      error: error.message
    });
  }
};

module.exports = {
  getLostFoundItems,
  getLostFoundItem,
  createLostFoundItem,
  updateLostFoundItem,
  deleteLostFoundItem,
  getLostFoundStats,
  getMyLostFoundItems
};
