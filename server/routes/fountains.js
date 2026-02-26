const express = require("express");
const router = express.Router();
const Fountain = require("../models/Fountain");
const Review = require("../models/Review");

// GET /api/fountains — all fountains (for map markers)
router.get("/", async (_req, res) => {
  try {
    const fountains = await Fountain.find().lean();
    res.json(fountains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/fountains/:id — single fountain
router.get("/:id", async (req, res) => {
  try {
    const fountain = await Fountain.findById(req.params.id).lean();
    if (!fountain) return res.status(404).json({ error: "Fountain not found" });
    res.json(fountain);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/fountains/:id/reviews — all reviews for a fountain
router.get("/:id/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ fountainId: req.params.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fountains/:id/reviews — create or update a review
router.post("/:id/reviews", async (req, res) => {
  try {
    const { userId, displayName, rating, text } = req.body;

    if (!userId || !rating) {
      return res.status(400).json({ error: "userId and rating are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const fountain = await Fountain.findById(req.params.id);
    if (!fountain) {
      return res.status(404).json({ error: "Fountain not found" });
    }

    const review = await Review.findOneAndUpdate(
      { fountainId: req.params.id, userId },
      {
        fountainId: req.params.id,
        userId,
        displayName: displayName || "Anonymous",
        rating,
        text: text || "",
      },
      { upsert: true, new: true, runValidators: true }
    );

    const [agg] = await Review.aggregate([
      { $match: { fountainId: fountain._id } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (agg) {
      fountain.avgRating = Math.round(agg.avgRating * 10) / 10;
      fountain.reviewCount = agg.reviewCount;
    } else {
      fountain.avgRating = 0;
      fountain.reviewCount = 0;
    }
    await fountain.save();

    res.json({
      review,
      avgRating: fountain.avgRating,
      reviewCount: fountain.reviewCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
