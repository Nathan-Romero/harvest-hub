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

let plantData;

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    mongoose.connect(process.env.MONGO_URI).then(() => {
      console.log("Connected to the database:");
      plantData = mongoose.model("plants", schema);
      plantData.find({}).lean().exec().then((items) => {
        console.log("Database contains " + items.length + " plants.");
        resolve();
      });
    }).catch((err) => {
      console.log("Error connecting to the database:");
      reject(err);
    });
  });
};

module.exports.getPlants = function () {
  return new Promise(function (resolve, reject) {
    plantData.find({}).lean().exec().then((plants) => {
      resolve(plants);
    }).catch((err) => {
      reject(err);
    });
  });
}

module.exports.getPlantById = function (id) {
  return new Promise(function (resolve, reject) {
    plantData.findById(id).lean().exec().then((plants) => {
      resolve(plants);
    }).catch((err) => {
      reject(err);
    });
  });
}
