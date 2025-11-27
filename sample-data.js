const mongoose = require('mongoose');
const PopularItem = require('./models/PopularItem');
const Review = require('./models/Review');
require('dotenv').config();

const sampleItems = [
  {
    name: "Spicy Chicken Burger",
    description: "Crispy chicken with spicy mayo and fresh vegetables",
    price: 12.99,
    originalPrice: 15.99,
    image: "food1",
    category: "Burgers",
    rating: 4.5,
    ratingCount: 128,
    preparationTime: 15,
    weeklyOrders: 45,
    tags: ["Spicy", "Popular", "Chicken"]
  },
  {
    name: "Margherita Pizza",
    description: "Classic pizza with tomato sauce and mozzarella",
    price: 16.99,
    originalPrice: 19.99,
    image: "food2",
    category: "Pizza",
    rating: 4.8,
    ratingCount: 95,
    preparationTime: 20,
    weeklyOrders: 38,
    tags: ["Vegetarian", "Classic", "Cheese"]
  },
  {
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with caesar dressing and croutons",
    price: 10.99,
    image: "food3",
    category: "Salads",
    rating: 4.2,
    ratingCount: 67,
    preparationTime: 10,
    weeklyOrders: 22,
    tags: ["Healthy", "Fresh", "Vegetarian"]
  }
];

const sampleReviews = [
  {
    userName: "John Doe",
    userImage: "default_profile",
    rating: 5,
    comment: "Amazing food and quick delivery!",
    isFeatured: true
  },
  {
    userName: "Sarah Smith",
    userImage: "default_profile",
    rating: 4,
    comment: "Great taste, will order again!",
    isFeatured: true
  }
];

const insertSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await PopularItem.deleteMany({});
    await Review.deleteMany({});

    // Insert sample items
    await PopularItem.insertMany(sampleItems);
    console.log('Sample items inserted');

    // Insert sample reviews
    await Review.insertMany(sampleReviews);
    console.log('Sample reviews inserted');

    console.log('Sample data inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error inserting sample data:', error);
    process.exit(1);
  }
};

insertSampleData();