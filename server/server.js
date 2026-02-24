require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { protect } = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;
const publicDir = path.join(__dirname, "..", "public");

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5000",
    credentials: true
  })
);
app.use(express.json());
app.use(express.static(publicDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "login.html"));
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/todos", protect, require("./routes/todoroutes"));
app.use("/api/habits", protect, require("./routes/habitRoutes"));
app.use("/api/expenses", protect, require("./routes/expenseRoutes"));
app.use("/api/events", protect, require("./routes/eventRoutes"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
