require("dotenv").config({path: require('path').join(__dirname, '../.env')});
const mongoose = require('mongoose');
const Listing = require("../models/listing.js");
const User = require("../models/User.js");
const initData = require("./data.js");

const dburl = process.env.ATLASDB_URL;

main()
    .then(() => console.log("connection established"))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(dburl);
}

const initdb = async () => {
    // Create seed user if not exists
    let seedUser = await User.findOne({ username: "admin" });
    if (!seedUser) {
        seedUser = new User({ email: "admin@wanderlust.com", username: "admin" });
        await User.register(seedUser, "admin@123");
        console.log("Seed user created:", seedUser._id);
    } else {
        console.log("Seed user already exists:", seedUser._id);
    }

    let dataWithOwner = initData.data.map(obj => ({
        ...obj,
        owner: seedUser._id
    }));

    const result = await Listing.insertMany(dataWithOwner);
    console.log("Inserted count:", result.length);
    mongoose.connection.close();
};

initdb();