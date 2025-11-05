import foodModel from "../models/foodModel.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Configure Cloudinary using env vars (safe to call here)
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Helper: upload buffer to Cloudinary using upload_stream
const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "food_images", resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Add food item
const addFood = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    // Upload buffer to Cloudinary
    const result = await uploadBufferToCloudinary(req.file.buffer);
    const image_url = result.secure_url || result.url;

    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: image_url,
    });

    await food.save();
    res.json({ success: true, message: "Food Added", data: food });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error adding food", error: error.message });
  }
};

// Get all food items
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching food list" });
  }
};

// Remove food item
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }

    // ✅ No need to unlink or delete file from Vercel — Cloudinary handles storage
    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error removing food" });
  }
};

export { addFood, listFood, removeFood };
