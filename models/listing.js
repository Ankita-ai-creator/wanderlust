const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const defaultImageUrl =
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=60";

const listingSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    image: {
        filename: String,
        url: {
            type: String,
            default: defaultImageUrl,
            set: (v) => v === "" ? defaultImageUrl : v,
        },
    },
    price: Number,
    location: { type: String, required: true },
    country: { type: String, required: true },
    category: {                                         // ← add this
        type: String,
        enum: ["beach", "mountain", "city", "camping", "castle", "lakefront", "skiing", "tropical"],
        default: null,
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    owner: { type: Schema.Types.ObjectId, ref: "User" }
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;