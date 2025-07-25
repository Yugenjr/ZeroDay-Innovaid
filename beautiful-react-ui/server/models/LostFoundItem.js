const mongoose = require('mongoose');

const lostFoundItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: [true, 'Please specify if this is a lost or found item']
  },
  itemName: {
    type: String,
    required: [true, 'Please provide the item name'],
    trim: true,
    maxlength: [100, 'Item name cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Electronics', 'Books', 'Bag', 'Accessories', 'ID/Card', 'Clothing', 'Other']
  },
  location: {
    type: String,
    required: [true, 'Please provide the location where item was lost/found'],
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedByName: {
    type: String,
    required: true
  },
  contactInfo: {
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'claimed', 'resolved'],
    default: 'pending'
  },
  images: [{
    type: String, // URLs to uploaded images
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(v);
      },
      message: 'Please provide a valid image URL'
    }
  }],
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot be more than 500 characters']
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  claimedAt: {
    type: Date
  },
  resolvedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
lostFoundItemSchema.index({ type: 1, status: 1 });
lostFoundItemSchema.index({ category: 1 });
lostFoundItemSchema.index({ reportedBy: 1 });
lostFoundItemSchema.index({ createdAt: -1 });
lostFoundItemSchema.index({ location: 'text', itemName: 'text', description: 'text' });

// Virtual for days since reported
lostFoundItemSchema.virtual('daysSinceReported').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for formatted date
lostFoundItemSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Pre-save middleware to update lastUpdated
lostFoundItemSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Pre-save middleware to set resolved/claimed dates
lostFoundItemSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date();
    } else if (this.status === 'claimed' && !this.claimedAt) {
      this.claimedAt = new Date();
    }
  }
  next();
});

// Static method to get statistics
lostFoundItemSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        lost: { $sum: { $cond: [{ $eq: ['$type', 'lost'] }, 1, 0] } },
        found: { $sum: { $cond: [{ $eq: ['$type', 'found'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $in: ['$status', ['resolved', 'claimed']] }, 1, 0] } }
      }
    }
  ]);
};

// Instance method to increment view count
lostFoundItemSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

module.exports = mongoose.model('LostFoundItem', lostFoundItemSchema);
