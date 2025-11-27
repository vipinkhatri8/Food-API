const express = require('express');
const authMiddleware = require('../middleware/auth');
const Order = require('../models/Order');

const router = express.Router();

// GET RUNNING ORDERS (for bottom sheet)
router.get('/running', authMiddleware, async (req, res) => {
  try {
    const runningOrders = await Order.find({
      status: { $in: ['confirmed', 'preparing', 'ready'] }
    })
    .sort({ createdAt: -1 })
    .select('orderNumber items totalAmount status customerName estimatedTime orderType')
    .populate('items.itemId', 'name image');

    res.json({
      success: true,
      data: runningOrders
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET ORDER REQUESTS (pending orders)
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const orderRequests = await Order.find({
      status: 'pending'
    })
    .sort({ createdAt: -1 })
    .select('orderNumber items totalAmount customerName orderType createdAt')
    .populate('items.itemId', 'name image price');

    res.json({
      success: true,
      data: orderRequests
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// UPDATE ORDER STATUS
router.put('/:orderId/status', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// GET ORDER DETAILS
router.get('/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('items.itemId', 'name image price description')
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;