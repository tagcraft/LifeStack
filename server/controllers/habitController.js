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
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    let lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted) : null;
    let startOfLastCompleted = lastCompleted
      ? new Date(lastCompleted.getFullYear(), lastCompleted.getMonth(), lastCompleted.getDate())
      : null;

    if (!startOfLastCompleted) {
      habit.streak = 1;
    } else if (startOfLastCompleted.getTime() === startOfToday.getTime()) {
      // already completed today; no streak change
    } else {
      const dayDiff = Math.round(
        (startOfToday.getTime() - startOfLastCompleted.getTime()) / 86400000
      );
      if (dayDiff === 1) {
        habit.streak = habit.streak + 1;
      } else {
        habit.streak = 1;
      }
    }

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
