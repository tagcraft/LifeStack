const express = require("express");
const router = express.Router();

const {
  createHabit,
  getHabits,
  deleteHabit,
  completeHabit
} = require("../controllers/habitController");

router.post("/", createHabit);
router.get("/", getHabits);
router.delete("/:id", deleteHabit);
router.put("/complete/:id", completeHabit);

module.exports = router;
