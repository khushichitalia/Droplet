const express = require("express");
const router = express.Router();
const Bottle = require("../models/Bottle");

// Get water intake for a specific user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    let bottle = await Bottle.findOne({ userId });

    if (!bottle) {
      return res.status(404).json({ message: "Bottle data not found" });
    }

    res.json({
      waterDrankDaily: bottle.waterDrankDaily,
      waterDrankMonthly: bottle.waterDrankMonthly,
      waterDrankYearly: bottle.waterDrankYearly,
      waterDrankDynamic: bottle.waterDrankDynamic,
      waterLevelRemaining: bottle.waterLevelRemaining,
      dailyGoal: bottle.dailyGoal,
      goalsReachedConsistently: bottle.goalsReachedConsistently,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update water intake (called when user drinks)
router.post("/:userId/drink", async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body; // amount in ml

    let bottle = await Bottle.findOne({ userId });

    if (!bottle) {
      bottle = new Bottle({ userId });
    }

    bottle.waterDrankDaily += amount;
    bottle.waterDrankMonthly += amount;
    bottle.waterDrankYearly += amount;
    bottle.waterDrankDynamic += amount;
    bottle.waterLevelRemaining -= amount;

    await bottle.save();

    res.json({
      message: "Water intake updated",
      waterDrankDaily: bottle.waterDrankDaily,
      waterLevelRemaining: bottle.waterLevelRemaining,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset daily water intake
router.post("/:userId/reset-daily", async (req, res) => {
  try {
    const { userId } = req.params;
    let bottle = await Bottle.findOne({ userId });

    if (!bottle) {
      return res.status(404).json({ message: "Bottle data not found" });
    }

    bottle.waterDrankDaily = 0;
    bottle.waterDrankDynamic = 0;

    await bottle.save();

    res.json({ message: "Daily water intake reset", waterDrankDaily: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
