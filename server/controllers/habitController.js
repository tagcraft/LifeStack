const Habit = require("../models/habit");

const createHabit = async (req, res) => {
  try {
    const habit = await Habit.create({ ...req.body, user: req.user._id });
    res.status(201).json(habit);
  } catch (error) {
    res.status(400).json({ message: "Failed to create habit", error: error.message });
  }
};

const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(habits);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch habits", error: error.message });
  }
};

const deleteHabit = async (req, res) => {
  try {
    const deleted = await Habit.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!deleted) {
      return res.status(404).json({ message: "Habit not found" });
    }
    res.status(200).json({ message: "Habit deleted" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete habit", error: error.message });
  }
};

const completeHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;

    const history = habit.completionHistory || [];
    if (history.includes(todayKey)) {
      return res.status(409).json({ message: "Habit already completed today" });
    }

    habit.completionHistory = [...history, todayKey];
    habit.lastCompleted = today;
    await habit.save();
    res.status(200).json(habit);
  } catch (error) {
    res.status(400).json({ message: "Failed to complete habit", error: error.message });
  }
};

module.exports = {
  createHabit,
  getHabits,
  deleteHabit,
  completeHabit
};
