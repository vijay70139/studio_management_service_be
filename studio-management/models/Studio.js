const mongoose = require("mongoose");

const StudioSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    pricing: { type: Number, required: true },
    availability: { type: Boolean, default: true },
    contactInfo: { type: String, required: true },
    rating: { type: Number, default: null },
    photo: { type: String },
    base64WithMimeType: { type: String }
});

module.exports = mongoose.model("Studio", StudioSchema);
