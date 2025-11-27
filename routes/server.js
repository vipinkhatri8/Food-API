require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/home", require("./routes/home"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/items", require("./routes/items"));

app.listen(4000, () => console.log("Server running on port 4000"));