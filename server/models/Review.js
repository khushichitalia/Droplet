const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    fountainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fountain",
      required: true,
    },
    userId: { type: String, required: true },
    displayName: { type: String, default: "Anonymous" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, default: "" },
  },
  { timestamps: true }
);

reviewSchema.index({ fountainId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
