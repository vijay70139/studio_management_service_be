const express = require("express");
const router = express.Router();
const multer = require("multer");
const Studio = require("../models/Studio");
const fs = require("fs");
const authenticateToken = require("../middleware/authMiddleware");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post(
  "/studios",
  authenticateToken,
  upload.single("photo"),
  async (req, res) => {
    try {
      const {
        name,
        location,
        category,
        description,
        pricing,
        availability,
        contactInfo,
        rating,
      } = req.body;
      const photo = req.file ? `./assets/${req.file.filename}` : null;

      const base64Image = convertImageToBase64(photo);
      const base64WithMimeType = `data:image/jpeg;base64,${base64Image}`;
      console.log(base64WithMimeType);
      const newStudio = new Studio({
        name,
        location,
        category,
        description,
        pricing,
        availability,
        contactInfo,
        rating,
        photo,
        base64WithMimeType,
      });

      const savedStudio = await newStudio.save();
      res.status(201).json(savedStudio);
    } catch (error) {
      res.status(500).json({ message: "Error adding studio", error });
    }
  }
);

router.get("/studios/:id", authenticateToken, async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.id);
    if (!studio) return res.status(404).json({ message: "Studio not found" });
    res.json(studio);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put(
  "/studios/:id",
  authenticateToken,
  upload.single("photo"),
  async (req, res) => {
    try {
      const studio = await Studio.findById(req.params.id);
      if (!studio) return res.status(404).json({ message: "Studio not found" });

      studio.name = req.body.name || studio.name;
      studio.location = req.body.location || studio.location;
      studio.category = req.body.category || studio.category;
      studio.description = req.body.description || studio.description;
      studio.pricing = req.body.pricing || studio.pricing;
      studio.availability =
        req.body.availability === "true" || studio.availability;
      studio.contactInfo = req.body.contactInfo || studio.contactInfo;
      studio.rating = req.body.rating || studio.rating;

      // Update photo if a new one is uploaded
      if (req.file) {
        studio.photo = `/assets/${req.file.filename}`;
      }

      await studio.save();
      res.json(studio);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// Delete a studio
router.delete("/studios/:id", authenticateToken, async (req, res) => {
  try {
    const studio = await Studio.findByIdAndDelete(req.params.id);
    if (!studio) return res.status(404).json({ message: "Studio not found" });
    res.json({ message: "Studio deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/studios", async (req, res) => {
  const filters = {};
  if (req.query.location) filters.location = req.query.location;
  if (req.query.category) filters.category = req.query.category;
  if (req.query.rating) filters.rating = { $gte: req.query.rating };
  if (req.query.price) {
    const priceRange = req.query.price.split("-");
    filters.pricing = { $gte: priceRange[0], $lte: priceRange[1] };
  }

  try {
    const studios = await Studio.find(filters);
    res.json(studios);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const convertImageToBase64 = (imagePath) => {
  try {
    // Read the file as binary data
    const imageBuffer = fs.readFileSync(imagePath);

    // Convert binary data to a Base64 encoded string
    const base64Image = imageBuffer.toString("base64");

    // Return the Base64 string
    return base64Image;
  } catch (error) {
    console.error("Error converting image to Base64:", error);
    return null;
  }
};

module.exports = router;
