// const express = require('express');
// const authMiddleware = require('../middleware/auth');
// const Order = require('../models/Order');
// const PopularItem = require('../models/PopularItem');
// const Review = require('../models/Review');

// const router = express.Router();

// // GET HOME SCREEN DATA
// router.get('/dashboard', authMiddleware, async (req, res) => {
//   try {
//     const userId = req.user._id;

//     // Get running orders count
//     const runningOrders = await Order.countDocuments({
//       status: { $in: ['confirmed', 'preparing', 'ready'] }
//     });

//     // Get pending order requests count
//     const orderRequests = await Order.countDocuments({
//       status: 'pending'
//     });

//     // Calculate total revenue (last 7 days)
//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
//     const revenueData = await Order.aggregate([
//       {
//         $match: {
//           status: 'completed',
//           createdAt: { $gte: sevenDaysAgo }
//         }
//       },
//       {
//         $group: {
//           _id: {
//             year: { $year: '$createdAt' },
//             month: { $month: '$createdAt' },
//             day: { $dayOfMonth: '$createdAt' }
//           },
//           totalRevenue: { $sum: '$totalAmount' },
//           orderCount: { $sum: 1 }
//         }
//       },
//       { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
//     ]);

//     // Format revenue data for chart
//     const chartData = revenueData.map((item, index) => ({
//       x: index,
//       y: item.totalRevenue,
//       orders: item.orderCount
//     }));

//     // Get total revenue
//     const totalRevenueResult = await Order.aggregate([
//       {
//         $match: {
//           status: 'completed',
//           createdAt: { $gte: sevenDaysAgo }
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           totalRevenue: { $sum: '$totalAmount' }
//         }
//       }
//     ]);

//     const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;

//     // Get reviews summary
//     const reviewsSummary = await Review.aggregate([
//       {
//         $group: {
//           _id: null,
//           averageRating: { $avg: '$rating' },
//           totalReviews: { $sum: 1 }
//         }
//       }
//     ]);

//     const rating = reviewsSummary[0]?.averageRating || 0;
//     const totalReviews = reviewsSummary[0]?.totalReviews || 0;

//     // Get popular items
//     const popularItems = await PopularItem.find({ isAvailable: true })
//       .sort({ weeklyOrders: -1 })
//       .limit(10)
//       .select('name price originalPrice image rating ratingCount preparationTime');

//     res.json({
//       success: true,
//       data: {
//         runningOrders,
//         orderRequests,
//         revenue: {
//           total: totalRevenue,
//           chartData: chartData
//         },
//         reviews: {
//           rating: Math.round(rating * 10) / 10, // Round to 1 decimal
//           totalReviews
//         },
//         popularItems: popularItems.map(item => ({
//           id: item._id,
//           name: item.name,
//           price: item.price,
//           originalPrice: item.originalPrice,
//           image: item.image,
//           rating: item.rating,
//           ratingCount: item.ratingCount,
//           preparationTime: item.preparationTime
//         }))
//       }
//     });

//   } catch (error) {
//     res.status(500).json({ 
//       success: false,
//       error: error.message 
//     });
//   }
// });

// // GET REVENUE DATA BY PERIOD
// router.get('/revenue/:period', authMiddleware, async (req, res) => {
//   try {
//     const { period } = req.params; // daily, weekly, monthly
//     let startDate = new Date();
//     let groupFormat = {};

//     switch (period) {
//       case 'daily':
//         startDate.setDate(startDate.getDate() - 7);
//         groupFormat = {
//           year: { $year: '$createdAt' },
//           month: { $month: '$createdAt' },
//           day: { $dayOfMonth: '$createdAt' }
//         };
//         break;
//       case 'weekly':
//         startDate.setDate(startDate.getDate() - 30);
//         groupFormat = {
//           year: { $year: '$createdAt' },
//           week: { $week: '$createdAt' }
//         };
//         break;
//       case 'monthly':
//         startDate.setFullYear(startDate.getFullYear() - 1);
//         groupFormat = {
//           year: { $year: '$createdAt' },
//           month: { $month: '$createdAt' }
//         };
//         break;
//       default:
//         startDate.setDate(startDate.getDate() - 7);
//         groupFormat = {
//           year: { $year: '$createdAt' },
//           month: { $month: '$createdAt' },
//           day: { $dayOfMonth: '$createdAt' }
//         };
//     }

//     const revenueData = await Order.aggregate([
//       {
//         $match: {
//           status: 'completed',
//           createdAt: { $gte: startDate }
//         }
//       },
//       {
//         $group: {
//           _id: groupFormat,
//           revenue: { $sum: '$totalAmount' },
//           orders: { $sum: 1 }
//         }
//       },
//       { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
//     ]);

//     res.json({
//       success: true,
//       data: revenueData
//     });

//   } catch (error) {
//     res.status(500).json({ 
//       success: false,
//       error: error.message 
//     });
//   }
// });

// // GET POPULAR ITEMS
// router.get('/popular-items', authMiddleware, async (req, res) => {
//   try {
//     const { limit = 10 } = req.query;

//     const popularItems = await PopularItem.find({ isAvailable: true })
//       .sort({ weeklyOrders: -1, rating: -1 })
//       .limit(parseInt(limit))
//       .select('name price originalPrice image rating ratingCount preparationTime tags');

//     res.json({
//       success: true,
//       data: popularItems
//     });

//   } catch (error) {
//     res.status(500).json({ 
//       success: false,
//       error: error.message 
//     });
//   }
// });

// // GET REVIEWS
// router.get('/reviews', authMiddleware, async (req, res) => {
//   try {
//     const { page = 1, limit = 5 } = req.query;

//     const reviews = await Review.find()
//       .sort({ createdAt: -1 })
//       .limit(parseInt(limit) * parseInt(page))
//       .select('userName userImage rating comment createdAt isFeatured');

//     const featuredReviews = await Review.find({ isFeatured: true })
//       .limit(3)
//       .select('userName userImage rating comment createdAt');

//     const reviewsSummary = await Review.aggregate([
//       {
//         $group: {
//           _id: null,
//           averageRating: { $avg: '$rating' },
//           totalReviews: { $sum: 1 },
//           ratingDistribution: {
//             $push: '$rating'
//           }
//         }
//       }
//     ]);

//     res.json({
//       success: true,
//       data: {
//         reviews,
//         featuredReviews,
//         summary: reviewsSummary[0] || { averageRating: 0, totalReviews: 0 }
//       }
//     });

//   } catch (error) {
//     res.status(500).json({ 
//       success: false,
//       error: error.message 
//     });
//   }
// });

// module.exports = router;

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

    // Check if we have any data in database
    const hasData = await PopularItem.countDocuments() > 0;

    // If no data exists, return comprehensive dummy data
    if (!hasData) {
      const dummyData = {
        runningOrders: 5,
        orderRequests: 3,
        revenue: {
          total: 2847.50,
          chartData: [
            { x: 0, y: 320.25, orders: 8, label: "Mon" },
            { x: 1, y: 450.75, orders: 12, label: "Tue" },
            { x: 2, y: 380.50, orders: 10, label: "Wed" },
            { x: 3, y: 520.00, orders: 15, label: "Thu" },
            { x: 4, y: 480.25, orders: 13, label: "Fri" },
            { x: 5, y: 410.75, orders: 11, label: "Sat" },
            { x: 6, y: 285.00, orders: 7, label: "Sun" }
          ]
        },
        reviews: {
          rating: 4.6,
          totalReviews: 342,
          distribution: {
            fiveStar: 180,
            fourStar: 120,
            threeStar: 30,
            twoStar: 8,
            oneStar: 4
          }
        },
        popularItems: [
          {
            id: "1",
            name: "Spicy Chicken Burger",
            description: "Crispy chicken with spicy mayo and fresh vegetables",
            price: 12.99,
            originalPrice: 15.99,
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
            category: "Burgers",
            rating: 4.5,
            ratingCount: 128,
            preparationTime: 15,
            weeklyOrders: 45,
            tags: ["Spicy", "Popular", "Chicken"],
            isAvailable: true
          },
          {
            id: "2",
            name: "Margherita Pizza",
            description: "Classic pizza with tomato sauce and mozzarella cheese",
            price: 16.99,
            originalPrice: 19.99,
            image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop",
            category: "Pizza",
            rating: 4.8,
            ratingCount: 95,
            preparationTime: 20,
            weeklyOrders: 38,
            tags: ["Vegetarian", "Classic", "Cheese"],
            isAvailable: true
          },
          {
            id: "3",
            name: "BBQ Chicken Wings",
            description: "Crispy chicken wings with signature BBQ glaze",
            price: 14.99,
            originalPrice: 17.99,
            image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop",
            category: "Appetizers",
            rating: 4.6,
            ratingCount: 89,
            preparationTime: 12,
            weeklyOrders: 35,
            tags: ["Spicy", "Crispy", "BBQ"],
            isAvailable: true
          },
          {
            id: "4",
            name: "Caesar Salad",
            description: "Fresh romaine lettuce with caesar dressing and croutons",
            price: 10.99,
            originalPrice: 12.99,
            image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
            category: "Salads",
            rating: 4.2,
            ratingCount: 67,
            preparationTime: 10,
            weeklyOrders: 22,
            tags: ["Healthy", "Fresh", "Vegetarian"],
            isAvailable: true
          },
          {
            id: "5",
            name: "Chocolate Brownie",
            description: "Warm chocolate brownie with vanilla ice cream",
            price: 8.99,
            image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
            category: "Desserts",
            rating: 4.7,
            ratingCount: 112,
            preparationTime: 8,
            weeklyOrders: 28,
            tags: ["Sweet", "Chocolate", "Dessert"],
            isAvailable: true
          },
          {
            id: "6",
            name: "Beef Tacos",
            description: "Three soft tacos with seasoned beef and fresh toppings",
            price: 11.99,
            originalPrice: 13.99,
            image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop",
            category: "Mexican",
            rating: 4.4,
            ratingCount: 76,
            preparationTime: 14,
            weeklyOrders: 31,
            tags: ["Spicy", "Beef", "Mexican"],
            isAvailable: true
          },
          {
            id: "7",
            name: "Vegetable Sushi Roll",
            description: "Fresh avocado, cucumber and carrot sushi rolls",
            price: 13.99,
            originalPrice: 16.99,
            image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
            category: "Sushi",
            rating: 4.3,
            ratingCount: 58,
            preparationTime: 18,
            weeklyOrders: 19,
            tags: ["Healthy", "Vegetarian", "Japanese"],
            isAvailable: true
          },
          {
            id: "8",
            name: "Grilled Salmon",
            description: "Fresh salmon fillet with lemon butter sauce",
            price: 22.99,
            originalPrice: 26.99,
            image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
            category: "Seafood",
            rating: 4.9,
            ratingCount: 42,
            preparationTime: 22,
            weeklyOrders: 15,
            tags: ["Healthy", "Seafood", "Grilled"],
            isAvailable: true
          }
        ],
        featuredReviews: [
          {
            id: "1",
            userName: "John Doe",
            userImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            rating: 5,
            comment: "Amazing food and quick delivery! The burger was perfectly cooked and the fries were crispy. Will definitely order again!",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            isFeatured: true
          },
          {
            id: "2",
            userName: "Sarah Smith",
            userImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            rating: 4,
            comment: "Great taste and good portion sizes. The pizza was delicious and arrived hot. The delivery was faster than expected!",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            isFeatured: true
          },
          {
            id: "3",
            userName: "Mike Johnson",
            userImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            rating: 5,
            comment: "Best burger I've had in a long time. The ingredients were fresh and the spicy mayo was perfect. Highly recommended!",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            isFeatured: true
          }
        ],
        runningOrdersList: [
          {
            id: "1",
            orderNumber: "ORD-001",
            customerName: "John Doe",
            items: [
              { name: "Spicy Chicken Burger", quantity: 2 },
              { name: "French Fries", quantity: 1 }
            ],
            totalAmount: 29.97,
            status: "preparing",
            estimatedTime: 15,
            orderType: "delivery"
          },
          {
            id: "2",
            orderNumber: "ORD-002",
            customerName: "Sarah Smith",
            items: [
              { name: "Margherita Pizza", quantity: 1 }
            ],
            totalAmount: 16.99,
            status: "confirmed",
            estimatedTime: 20,
            orderType: "pickup"
          },
          {
            id: "3",
            orderNumber: "ORD-003",
            customerName: "Mike Johnson",
            items: [
              { name: "BBQ Chicken Wings", quantity: 1 },
              { name: "Caesar Salad", quantity: 1 }
            ],
            totalAmount: 25.98,
            status: "ready",
            estimatedTime: 5,
            orderType: "delivery"
          }
        ],
        orderRequestsList: [
          {
            id: "4",
            orderNumber: "ORD-004",
            customerName: "Emily Davis",
            items: [
              { name: "Chocolate Brownie", quantity: 2 },
              { name: "Vanilla Milkshake", quantity: 1 }
            ],
            totalAmount: 24.97,
            orderType: "pickup",
            createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
          },
          {
            id: "5",
            orderNumber: "ORD-005",
            customerName: "David Wilson",
            items: [
              { name: "Beef Tacos", quantity: 1 },
              { name: "Guacamole", quantity: 1 }
            ],
            totalAmount: 16.98,
            orderType: "delivery",
            createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
          }
        ],
        stats: {
          todayOrders: 24,
          todayRevenue: 428.50,
          avgPreparationTime: 14,
          customerSatisfaction: 94
        }
      };

      return res.json({
        success: true,
        data: dummyData,
        message: "Dummy data loaded successfully"
      });
    }

    // If database has data, fetch real data
    const runningOrders = await Order.countDocuments({
      status: { $in: ['confirmed', 'preparing', 'ready'] }
    });

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
      orders: item.orderCount,
      label: new Date(item._id.year, item._id.month - 1, item._id.day).toLocaleDateString('en', { weekday: 'short' })
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
      .select('name description price originalPrice image category rating ratingCount preparationTime weeklyOrders tags isAvailable');

    // Get featured reviews
    const featuredReviews = await Review.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('userName userImage rating comment createdAt isFeatured');

    // Get running orders list
    const runningOrdersList = await Order.find({
      status: { $in: ['confirmed', 'preparing', 'ready'] }
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('orderNumber items totalAmount status customerName estimatedTime orderType createdAt');

    // Get order requests list
    const orderRequestsList = await Order.find({
      status: 'pending'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('orderNumber items totalAmount customerName orderType createdAt');

    // Today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart }
        }
      },
      {
        $group: {
          _id: null,
          todayOrders: { $sum: 1 },
          todayRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const todayData = todayStats[0] || { todayOrders: 0, todayRevenue: 0 };

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
          rating: Math.round(rating * 10) / 10,
          totalReviews
        },
        popularItems: popularItems.map(item => ({
          id: item._id,
          name: item.name,
          description: item.description,
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.image,
          category: item.category,
          rating: item.rating,
          ratingCount: item.ratingCount,
          preparationTime: item.preparationTime,
          weeklyOrders: item.weeklyOrders,
          tags: item.tags,
          isAvailable: item.isAvailable
        })),
        featuredReviews: featuredReviews.map(review => ({
          id: review._id,
          userName: review.userName,
          userImage: review.userImage,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          isFeatured: review.isFeatured
        })),
        runningOrdersList: runningOrdersList.map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          items: order.items,
          totalAmount: order.totalAmount,
          status: order.status,
          estimatedTime: order.estimatedTime,
          orderType: order.orderType
        })),
        orderRequestsList: orderRequestsList.map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          items: order.items,
          totalAmount: order.totalAmount,
          orderType: order.orderType,
          createdAt: order.createdAt
        })),
        stats: {
          todayOrders: todayData.todayOrders,
          todayRevenue: todayData.todayRevenue,
          avgPreparationTime: 14, // This would need to be calculated
          customerSatisfaction: 92 // This would need to be calculated from reviews
        }
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
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

// GET DASHBOARD STATS
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Last week date range
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    lastWeekStart.setHours(0, 0, 0, 0);

    const stats = await Order.aggregate([
      {
        $facet: {
          todayStats: [
            {
              $match: {
                createdAt: { $gte: todayStart, $lte: todayEnd }
              }
            },
            {
              $group: {
                _id: null,
                orders: { $sum: 1 },
                revenue: { $sum: '$totalAmount' }
              }
            }
          ],
          weekStats: [
            {
              $match: {
                createdAt: { $gte: lastWeekStart }
              }
            },
            {
              $group: {
                _id: null,
                orders: { $sum: 1 },
                revenue: { $sum: '$totalAmount' }
              }
            }
          ],
          statusCounts: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const todayData = stats[0].todayStats[0] || { orders: 0, revenue: 0 };
    const weekData = stats[0].weekStats[0] || { orders: 0, revenue: 0 };
    const statusCounts = stats[0].statusCounts;

    const runningOrders = statusCounts.find(s => s._id === 'preparing')?.count || 0 +
                         statusCounts.find(s => s._id === 'confirmed')?.count || 0 +
                         statusCounts.find(s => s._id === 'ready')?.count || 0;

    const orderRequests = statusCounts.find(s => s._id === 'pending')?.count || 0;

    res.json({
      success: true,
      data: {
        today: {
          orders: todayData.orders,
          revenue: todayData.revenue
        },
        week: {
          orders: weekData.orders,
          revenue: weekData.revenue
        },
        runningOrders,
        orderRequests
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