const express = require("express");
const router = express.Router();

const {
  createExpense,
  getExpenses,
  deleteExpense,
  getMonthlySummary,
  getCategoryBreakdown
} = require("../controllers/expenseController");

router.post("/", createExpense);
router.get("/", getExpenses);
router.delete("/:id", deleteExpense);
router.get("/summary/month", getMonthlySummary);
router.get("/summary/category", getCategoryBreakdown);

module.exports = router;
