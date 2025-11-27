const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ YAHAN CONNECTION CODE LIKHEIN:
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected Successfully!'))
.catch(err => console.log('❌ Connection Error:', err));

// // Basic route
// app.get('/', (req, res) => {
//   res.json({ message: 'Food App API is working!' });
// });

// // User model and routes yahan add karenge

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use("/api/home", require("./routes/home")); // ✅ ADD THIS
app.use("/api/orders", require("./routes/orders")); // ✅ ADD THIS
app.use("/api/items", require("./routes/items")); // ✅ ADD THIS

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Food App API is working!' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});