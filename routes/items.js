const express = require('express');
const authMiddleware = require('../middleware/auth');
const PopularItem = require('../models/PopularItem');

const router = express.Router();

// GET ITEM DETAILS
router.get('/:itemId', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await PopularItem.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET ALL ITEMS (for "See All" screen)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category, sortBy = 'popular', page = 1, limit = 20 } = req.query;
    
    let query = { isAvailable: true };
    let sortOptions = {};

    // Filter by category if provided
    if (category && category !== 'all') {
      query.category = category;
    }

    // Sort options
    switch (sortBy) {
      case 'popular':
        sortOptions = { weeklyOrders: -1, rating: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1, ratingCount: -1 };
        break;
      case 'price-low':
        sortOptions = { price: 1 };
        break;
      case 'price-high':
        sortOptions = { price: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { weeklyOrders: -1 };
    }

    const items = await PopularItem.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit) * parseInt(page))
      .select('name price originalPrice image rating ratingCount preparationTime category tags');

    // Get categories for filter
    const categories = await PopularItem.distinct('category', { isAvailable: true });

    res.json({
      success: true,
      data: {
        items,
        categories,
        total: items.length
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// UPDATE ITEM (for admin)
router.put('/:itemId', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.params;
    const updateData = req.body;

    const item = await PopularItem.findByIdAndUpdate(
      itemId,
      updateData,
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;