const Todo = require("../models/todo");

const createTodo = async (req, res) => {
  try {
    const todo = await Todo.create({ ...req.body, user: req.user._id });
    res.status(201).json(todo);
  } catch (error) {
    res.status(400).json({ message: "Failed to create todo", error: error.message });
  }
};

const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id }).sort({ date: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch todos", error: error.message });
  }
};

const updateTodo = async (req, res) => {
  try {
    const updated = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Failed to update todo", error: error.message });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const deleted = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!deleted) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ message: "Todo deleted" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete todo", error: error.message });
  }
};

module.exports = {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo
};
