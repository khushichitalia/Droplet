require("dotenv").config();
const mongoose = require("mongoose");
const Fountain = require("./models/Fountain");

const fountains = [
  {
    name: "Marston Library",
    description: "Multiple water refill stations across floors",
    latitude: 29.6481,
    longitude: -82.3437,
  },
  {
    name: "Newell Hall",
    description: "Multiple water refill stations across floors",
    latitude: 29.649,
    longitude: -82.345,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    for (const f of fountains) {
      const existing = await Fountain.findOne({ name: f.name });
      if (existing) {
        console.log(`"${f.name}" already exists — skipping`);
      } else {
        await Fountain.create(f);
        console.log(`Created "${f.name}"`);
      }
    }

    console.log("Seed complete");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
