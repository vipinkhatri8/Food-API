const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');

// GET all food items with optional category filter
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let filter = {};
    
    // Filter by category if provided and not "All"
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    // Search by name if provided
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    
    const foodItems = await FoodItem.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: foodItems,
      totalItems: foodItems.length
    });
    
  } catch (error) {
    console.error('Error fetching food items:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching food items'
    });
  }
});

// GET food item by ID
router.get('/:id', async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        error: 'Food item not found'
      });
    }
    
    res.json({
      success: true,
      data: foodItem
    });
    
  } catch (error) {
    console.error('Error fetching food item:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching food item'
    });
  }
});

// POST create new food item
router.post('/', async (req, res) => {
  try {
    const foodItem = new FoodItem(req.body);
    await foodItem.save();
    
    res.status(201).json({
      success: true,
      data: foodItem
    });
    
  } catch (error) {
    console.error('Error creating food item:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating food item'
    });
  }
});

// PUT update food item
router.put('/:id', async (req, res) => {
  try {
    const foodItem = await FoodItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        error: 'Food item not found'
      });
    }
    
    res.json({
      success: true,
      data: foodItem
    });
    
  } catch (error) {
    console.error('Error updating food item:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating food item'
    });
  }
});

// DELETE food item
router.delete('/:id', async (req, res) => {
  try {
    const foodItem = await FoodItem.findByIdAndDelete(req.params.id);
    
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        error: 'Food item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Food item deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting food item:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting food item'
    });
  }
});

// POST endpoint to insert dummy food items
router.post('/insert-dummy-data', async (req, res) => {
  try {
    // Clear existing food items
    await FoodItem.deleteMany({});
    
    const dummyFoodItems = [
      {
        name: "Chicken Thai Biriyani",
        category: "Breakfast",
        price: 60.0,
        rating: 4.9,
        reviewCount: 10,
        image: "https://images.unsplash.com/photo-1563379091339-03246963d96f?w=400",
        description: "Flavorful Thai-style biriyani with tender chicken and aromatic spices",
        preparationTime: 30,
        tags: ["Spicy", "Rice", "Chicken"]
      },
      {
        name: "Chicken Bhuna",
        category: "Breakfast",
        price: 30.0,
        rating: 4.9,
        reviewCount: 10,
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
        description: "Traditional Indian chicken curry cooked with rich spices",
        preparationTime: 25,
        tags: ["Spicy", "Curry", "Chicken"]
      },
      {
        name: "Mazalichiken Halim",
        category: "Breakfast",
        price: 25.0,
        rating: 4.9,
        reviewCount: 10,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",
        description: "Hearty and nutritious chicken halim with wheat and lentils",
        preparationTime: 40,
        tags: ["Healthy", "Traditional", "Chicken"]
      },
      {
        name: "Grilled Salmon",
        category: "Lunch",
        price: 45.0,
        rating: 4.7,
        reviewCount: 15,
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
        description: "Fresh salmon grilled to perfection with lemon butter sauce",
        preparationTime: 20,
        tags: ["Healthy", "Seafood", "Grilled"]
      },
      {
        name: "Vegetable Pasta",
        category: "Lunch",
        price: 35.0,
        rating: 4.5,
        reviewCount: 8,
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400",
        description: "Fresh pasta with seasonal vegetables in tomato basil sauce",
        preparationTime: 15,
        tags: ["Vegetarian", "Pasta", "Healthy"]
      },
      {
        name: "Beef Steak",
        category: "Dinner",
        price: 75.0,
        rating: 4.8,
        reviewCount: 12,
        image: "https://images.unsplash.com/photo-1546833999-bf4f7b5b0c0d?w=400",
        description: "Premium beef steak cooked to your preference with side vegetables",
        preparationTime: 25,
        tags: ["Premium", "Beef", "Grilled"]
      },
      {
        name: "Mushroom Risotto",
        category: "Dinner",
        price: 40.0,
        rating: 4.6,
        reviewCount: 7,
        image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400",
        description: "Creamy risotto with wild mushrooms and parmesan cheese",
        preparationTime: 30,
        tags: ["Vegetarian", "Creamy", "Italian"]
      },
      {
        name: "Chicken Wrap",
        category: "Lunch",
        price: 28.0,
        rating: 4.4,
        reviewCount: 9,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
        description: "Grilled chicken wrap with fresh vegetables and sauces",
        preparationTime: 10,
        tags: ["Quick", "Chicken", "Wrap"]
      }
    ];

    const insertedItems = await FoodItem.insertMany(dummyFoodItems);
    
    res.json({
      success: true,
      message: 'Dummy food items inserted successfully!',
      data: {
        items: insertedItems.length,
        foodItems: insertedItems
      }
    });
    
  } catch (error) {
    console.error('Error inserting dummy food items:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;