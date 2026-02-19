const Event = require("../models/event");

const createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, user: req.user._id });
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: "Failed to create event", error: error.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ user: req.user._id }).sort({ date: 1, startTime: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events", error: error.message });
  }
};

const getEventsByMonth = async (req, res) => {
  try {
    const month = parseInt(req.query.month, 10);
    const year = parseInt(req.query.year, 10);

    if (Number.isNaN(month) || Number.isNaN(year)) {
      return res
        .status(400)
        .json({ message: "month and year query parameters are required" });
    }

    const startOfMonth = new Date(year, month - 1, 1);
    const startOfNextMonth = new Date(year, month, 1);

    const events = await Event.find({
      user: req.user._id,
      date: { $gte: startOfMonth, $lt: startOfNextMonth }
    }).sort({ date: 1, startTime: 1 });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events by month", error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const updated = await Event.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: "Failed to update event", error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const deleted = await Event.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!deleted) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete event", error: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventsByMonth,
  updateEvent,
  deleteEvent
};
