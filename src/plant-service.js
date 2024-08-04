const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  name: String,
  rarity: String,
  soil: String,
  water: {
    level: Number,
    message: String
  },
  temperature: {
    lowerlimit: Number,
    upperlimit: Number
  },
  space: Number,
  depth: Number,
  planting: String,
  harvest: {
    upperlimit: Number,
    lowerlimit: Number,
    message: String
  },
  season: String,
  techniquesTips: String,
  companions: [Number]
});

let plants;

module.exports.initialize = async function () {
  try {
    const db = await mongoose.createConnection(
      process.env.MONGODB_URI || "mongodb://localhost:27017/harvest-hub",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );

    db.on('error', (err) => {
      throw new Error(err); // throw the error to be caught by the catch block
    });

    await new Promise((resolve) => {
      db.once('open', resolve);
    });

    const database = db.useDb("harvest-hub");
    plants = database.collection("plants");
    return true; // Resolve the promise indicating successful initialization
  } catch (err) {
    throw new Error(`Failed to initialize the database: ${err.message}`);
  }
};

module.exports.getPlants = function () {
  return new Promise(function (resolve, reject) {
    plants.toArray().then((plants) => {
      resolve(plants);
    }).catch((err) => {
      reject(err);
    });
  });
}
