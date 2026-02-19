const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEvents,
  getEventsByMonth,
  updateEvent,
  deleteEvent
} = require("../controllers/eventController");

router.post("/", createEvent);
router.get("/", getEvents);
router.get("/month", getEventsByMonth);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

module.exports = router;
