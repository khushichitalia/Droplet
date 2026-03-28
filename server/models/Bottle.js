const mongoose = require("mongoose");

const bottleSchema = new mongoose.Schema(
  {
    waterLevelRemaining: { type: Number, default: 0 },
    waterDrankDaily: { type: Number, default: 0 },
    waterDrankMonthly: { type: Number, default: 0 },
    waterDrankYearly: { type: Number, default: 0 },
    waterDrankDynamic: { type: Number, default: 0 },
    initialWaterLevel: { type: Number, default: 0 },
    goalsReachedConsistently: { type: Number, default: 0 },
    dailyGoal: { type: Number, default: 2000 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Bottle", bottleSchema);
