const express = require('express');
const authMiddleware = require('../middleware/auth');
const Order = require('../models/Order');
const PopularItem = require('../models/PopularItem');
const Review = require('../models/Review');

const router = express.Router();

// GET HOME SCREEN DATA
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get running orders count
    const runningOrders = await Order.countDocuments({
      status: { $in: ['confirmed', 'preparing', 'ready'] }
    });

    // Get pending order requests count
    const orderRequests = await Order.countDocuments({
      status: 'pending'
    });

    // Calculate total revenue (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const revenueData = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Format revenue data for chart
    const chartData = revenueData.map((item, index) => ({
      x: index,
      y: item.totalRevenue,
      orders: item.orderCount
    }));

    // Get total revenue
    const totalRevenueResult = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;

    // Get reviews summary
    const reviewsSummary = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const rating = reviewsSummary[0]?.averageRating || 0;
    const totalReviews = reviewsSummary[0]?.totalReviews || 0;

    // Get popular items
    const popularItems = await PopularItem.find({ isAvailable: true })
      .sort({ weeklyOrders: -1 })
      .limit(10)
      .select('name price originalPrice image rating ratingCount preparationTime');

    res.json({
      success: true,
      data: {
        runningOrders,
        orderRequests,
        revenue: {
          total: totalRevenue,
          chartData: chartData
        },
        reviews: {
          rating: Math.round(rating * 10) / 10, // Round to 1 decimal
          totalReviews
        },
        popularItems: popularItems.map(item => ({
          id: item._id,
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.image,
          rating: item.rating,
          ratingCount: item.ratingCount,
          preparationTime: item.preparationTime
        }))
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET REVENUE DATA BY PERIOD
router.get('/revenue/:period', authMiddleware, async (req, res) => {
  try {
    const { period } = req.params; // daily, weekly, monthly
    let startDate = new Date();
    let groupFormat = {};

    switch (period) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 7);
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 30);
        groupFormat = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'monthly':
        startDate.setFullYear(startDate.getFullYear() - 1);
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      success: true,
      data: revenueData
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET POPULAR ITEMS
router.get('/popular-items', authMiddleware, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularItems = await PopularItem.find({ isAvailable: true })
      .sort({ weeklyOrders: -1, rating: -1 })
      .limit(parseInt(limit))
      .select('name price originalPrice image rating ratingCount preparationTime tags');

    res.json({
      success: true,
      data: popularItems
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET REVIEWS
router.get('/reviews', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;

    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) * parseInt(page))
      .select('userName userImage rating comment createdAt isFeatured');

    const featuredReviews = await Review.find({ isFeatured: true })
      .limit(3)
      .select('userName userImage rating comment createdAt');

    const reviewsSummary = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        featuredReviews,
        summary: reviewsSummary[0] || { averageRating: 0, totalReviews: 0 }
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;