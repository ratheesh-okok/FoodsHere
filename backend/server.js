import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import "dotenv/config";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Favicon handling - return 204 No Content
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Database connection with retry
const initDB = async () => {
    try {
        await connectDB();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        // In production, we might want to exit or retry
        if (process.env.NODE_ENV === 'production') {
            console.error('Fatal: Could not connect to database');
        }
    }
};
initDB();

// Static files
if (process.env.NODE_ENV !== 'production') {
    app.use("/images", express.static(path.join(__dirname, 'uploads')));
} else {
    // In production (Vercel), handle image requests differently
    app.get("/images/:filename", (req, res) => {
        res.redirect(`${process.env.VERCEL_URL}/uploads/${req.params.filename}`);
    });
}

// API Routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        status: "API Working",
        env: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.url}`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Handle specific errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({ 
            error: 'Validation Error',
            message: err.message
        });
    }
    
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        return res.status(503).json({
            error: 'Database Error',
            message: 'A database error occurred'
        });
    }

    // Default error response
    res.status(err.status || 500).json({
        error: 'Server Error',
        message: process.env.NODE_ENV === 'development' 
            ? err.message 
            : 'An unexpected error occurred'
    });
});

export default app;

// Local development: start server when not on serverless (Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
