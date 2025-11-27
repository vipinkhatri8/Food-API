// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ✅ YAHAN CONNECTION CODE LIKHEIN:
// require('dotenv').config();
// mongoose.connect(process.env.MONGODB_URI)
// .then(() => console.log('✅ MongoDB Connected Successfully!'))
// .catch(err => console.log('❌ Connection Error:', err));

// // // Basic route
// // app.get('/', (req, res) => {
// //   res.json({ message: 'Food App API is working!' });
// // });

// // // User model and routes yahan add karenge

// // const PORT = process.env.PORT || 3000;
// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running on port ${PORT}`);
// // });

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use("/api/home", require("./routes/home")); // ✅ ADD THIS
// app.use("/api/orders", require("./routes/orders")); // ✅ ADD THIS
// app.use("/api/items", require("./routes/items")); // ✅ ADD THIS

// // Basic route
// app.get('/', (req, res) => {
//   res.json({ message: 'Food App API is working!' });
// });

// const PORT = process.env.PORT || 10000;
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected Successfully!'))
.catch(err => console.log('❌ Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use("/api/home", require("./routes/home"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/items", require("./routes/items"));
// Add this with other route imports
app.use("/api/food-items", require("./routes/foodItems"));

// DUMMY DATA INSERTION ENDPOINT
app.post('/api/insert-dummy-data', async (req, res) => {
  try {
    const PopularItem = require('./models/PopularItem');
    const Review = require('./models/Review');
    const Order = require('./models/Order');
    const User = require('./models/User');

    // Clear existing data
    await PopularItem.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});

    // Sample popular items
    const sampleItems = [
      {
        name: "Spicy Chicken Burger",
        description: "Crispy chicken with spicy mayo and fresh vegetables",
        price: 12.99,
        originalPrice: 15.99,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        category: "Burgers",
        rating: 4.5,
        ratingCount: 128,
        preparationTime: 15,
        weeklyOrders: 45,
        tags: ["Spicy", "Popular", "Chicken"],
        isAvailable: true
      },
      {
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce and mozzarella",
        price: 16.99,
        originalPrice: 19.99,
        image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400",
        category: "Pizza",
        rating: 4.8,
        ratingCount: 95,
        preparationTime: 20,
        weeklyOrders: 38,
        tags: ["Vegetarian", "Classic", "Cheese"],
        isAvailable: true
      },
      {
        name: "Caesar Salad",
        description: "Fresh romaine lettuce with caesar dressing and croutons",
        price: 10.99,
        originalPrice: 12.99,
        image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
        category: "Salads",
        rating: 4.2,
        ratingCount: 67,
        preparationTime: 10,
        weeklyOrders: 22,
        tags: ["Healthy", "Fresh", "Vegetarian"],
        isAvailable: true
      },
      {
        name: "BBQ Chicken Wings",
        description: "Crispy chicken wings with BBQ glaze",
        price: 14.99,
        originalPrice: 17.99,
        image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400",
        category: "Appetizers",
        rating: 4.6,
        ratingCount: 89,
        preparationTime: 12,
        weeklyOrders: 35,
        tags: ["Spicy", "Crispy", "BBQ"],
        isAvailable: true
      },
      {
        name: "Chocolate Brownie",
        description: "Warm chocolate brownie with ice cream",
        price: 8.99,
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400",
        category: "Desserts",
        rating: 4.7,
        ratingCount: 112,
        preparationTime: 8,
        weeklyOrders: 28,
        tags: ["Sweet", "Chocolate", "Dessert"],
        isAvailable: true
      }
    ];

    // Sample reviews
    const sampleReviews = [
      {
        userName: "John Doe",
        userImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        rating: 5,
        comment: "Amazing food and quick delivery! Will definitely order again.",
        isFeatured: true
      },
      {
        userName: "Sarah Smith",
        userImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
        rating: 4,
        comment: "Great taste and good portion sizes. The pizza was delicious!",
        isFeatured: true
      },
      {
        userName: "Mike Johnson",
        userImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        rating: 5,
        comment: "Best burger I've had in a long time. Highly recommended!",
        isFeatured: false
      },
      {
        userName: "Emily Davis",
        userImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        rating: 4,
        comment: "Fresh ingredients and fast service. The salad was perfect!",
        isFeatured: true
      }
    ];

    // Sample orders
    const sampleOrders = [
      {
        orderNumber: "ORD-001",
        items: [
          { itemId: null, name: "Spicy Chicken Burger", price: 12.99, quantity: 2 },
          { itemId: null, name: "French Fries", price: 3.99, quantity: 1 }
        ],
        totalAmount: 29.97,
        status: "confirmed",
        customerName: "John Doe",
        estimatedTime: 25,
        orderType: "delivery"
      },
      {
        orderNumber: "ORD-002",
        items: [
          { itemId: null, name: "Margherita Pizza", price: 16.99, quantity: 1 }
        ],
        totalAmount: 16.99,
        status: "preparing",
        customerName: "Sarah Smith",
        estimatedTime: 20,
        orderType: "pickup"
      },
      {
        orderNumber: "ORD-003",
        items: [
          { itemId: null, name: "Caesar Salad", price: 10.99, quantity: 1 },
          { itemId: null, name: "Chocolate Brownie", price: 8.99, quantity: 2 }
        ],
        totalAmount: 28.97,
        status: "pending",
        customerName: "Mike Johnson",
        orderType: "delivery"
      },
      {
        orderNumber: "ORD-004",
        items: [
          { itemId: null, name: "BBQ Chicken Wings", price: 14.99, quantity: 1 },
          { itemId: null, name: "Coke", price: 2.99, quantity: 2 }
        ],
        totalAmount: 20.97,
        status: "ready",
        customerName: "Emily Davis",
        estimatedTime: 5,
        orderType: "pickup"
      },
      {
        orderNumber: "ORD-005",
        items: [
          { itemId: null, name: "Spicy Chicken Burger", price: 12.99, quantity: 1 },
          { itemId: null, name: "Caesar Salad", price: 10.99, quantity: 1 }
        ],
        totalAmount: 23.98,
        status: "completed",
        customerName: "David Wilson",
        orderType: "delivery",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ];

    // Insert items first to get their IDs
    const insertedItems = await PopularItem.insertMany(sampleItems);
    console.log('✅ Sample items inserted');

    // Update orders with actual item IDs
    sampleOrders[0].items[0].itemId = insertedItems[0]._id;
    sampleOrders[1].items[0].itemId = insertedItems[1]._id;
    sampleOrders[2].items[0].itemId = insertedItems[2]._id;
    sampleOrders[2].items[1].itemId = insertedItems[4]._id;
    sampleOrders[3].items[0].itemId = insertedItems[3]._id;
    sampleOrders[4].items[0].itemId = insertedItems[0]._id;
    sampleOrders[4].items[1].itemId = insertedItems[2]._id;

    // Insert orders
    await Order.insertMany(sampleOrders);
    console.log('✅ Sample orders inserted');

    // Insert reviews
    await Review.insertMany(sampleReviews);
    console.log('✅ Sample reviews inserted');

    res.json({
      success: true,
      message: 'Dummy data inserted successfully!',
      data: {
        items: insertedItems.length,
        orders: sampleOrders.length,
        reviews: sampleReviews.length
      }
    });

  } catch (error) {
    console.error('Error inserting dummy data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Food App API is working!' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});