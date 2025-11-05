import express from "express";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";
import multer from "multer";
import "dotenv/config";

const foodRouter = express.Router();

// Use memory storage in multer and upload to Cloudinary from controller
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Routes
foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);

export default foodRouter;
