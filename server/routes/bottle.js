const express = require("express");
const router = express.Router();
const Bottle = require("../models/Bottle");

router.get("/", async (req, res) => {
  try {
    let bottle = await Bottle.findOne();
    if (!bottle) {
      bottle = new Bottle();
      await bottle.save();
    }
    res.json(bottle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/", async (req, res) => {
  try {
    let bottle = await Bottle.findOne();
    if (!bottle) {
      bottle = new Bottle();
    }
    Object.assign(bottle, req.body);
    await bottle.save();
    res.json(bottle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
