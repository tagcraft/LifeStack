const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { protect } = require("./middleware/authMiddleware");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/todos", protect, require("./routes/todoroutes"));
app.use("/api/habits", protect, require("./routes/habitRoutes"));
app.use("/api/expenses", protect, require("./routes/expenseRoutes"));
app.use("/api/events", protect, require("./routes/eventRoutes"));


app.get("/", (req, res) => {
  res.send("API Running");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
