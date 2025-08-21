const mongoose = require("mongoose");
const initdata = require("./initaldata.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/velora";

main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}



const initDB = async () => {
  await Listing.deleteMany({});  // ⛔ Deletes all documents

  // ✅ Add "owner" field to each object
  initdata.data = initdata.data.map((obj) => ({
    ...obj,
    owner: "68a0307a2a5f85be56366d2c"
  }));

  await Listing.insertMany(initdata.data);  // ✅ Inserts initial data
  console.log("data was initialized");      // 🖨️ Confirms action
};



initDB();
