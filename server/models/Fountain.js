const mongoose = require("mongoose");

const fountainSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fountain", fountainSchema);
