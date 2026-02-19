const Expense = require("../models/expense");

const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, user: req.user._id });
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: "Failed to create expense", error: error.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expenses", error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete expense", error: error.message });
  }
};

const getMonthlySummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const result = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfMonth, $lt: startOfNextMonth }
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const total = result.length ? result[0].total : 0;
    res.status(200).json({ total });
  } catch (error) {
    res.status(500).json({ message: "Failed to get monthly summary", error: error.message });
  }
};

const getCategoryBreakdown = async (req, res) => {
  try {
    const result = await Expense.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $project: { _id: 0, category: "$_id", total: 1 } },
      { $sort: { category: 1 } }
    ]);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to get category breakdown", error: error.message });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  deleteExpense,
  getMonthlySummary,
  getCategoryBreakdown
};
