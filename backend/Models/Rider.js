const mongoose = require("mongoose");
const { Schema } = mongoose;

const riderSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone_number: { type: String, required: false },
    password: { type: String, required: false },
    profile_picture_url: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    gender: { type: String,required: false },
    dob: { type: Date, required: false },  
    age: { type: Number, required: false },
    wallet_balance: { type: Number, default: 0 },
    preferred_payment: { type: String, enum: ["card", "wallet", "cash"], default: "wallet" },
    role: { type: String, default: "rider" },
    home_location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    work_location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    ride_history: [{ type: Schema.Types.ObjectId, ref: "Ride" }],
    is_verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Rider = mongoose.model("Rider", riderSchema);
module.exports = Rider;
