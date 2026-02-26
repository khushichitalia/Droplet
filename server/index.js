require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const fountainRoutes = require("./routes/fountains");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/fountains", fountainRoutes);
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
