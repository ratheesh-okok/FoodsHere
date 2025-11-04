import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Middleware for parsing requests
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// Initialize server
const initializeServer = async () => {
    try {
        // Connect to database
        const dbConnected = await connectDB();
        if (!dbConnected) {
            throw new Error('Database connection failed');
        }

        // Ensure uploads directory exists
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!process.env.VERCEL) { // Skip on Vercel (uses blob storage instead)
            try {
                await fs.promises.mkdir(uploadsDir, { recursive: true });
            } catch (err) {
                console.warn('Warning: Could not create uploads directory:', err);
            }
        }

        return true;
    } catch (error) {
        console.error('Server initialization failed:', error);
        return false;
    }
};

// API endpoints
app.use("/api/food", foodRouter)
app.use("/images", express.static('uploads'))
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)

// Health check endpoint
app.get("/", async (req, res) => {
    const isConnected = mongoose.connection.readyState === 1;
    res.json({
        status: "API Working",
        database: isConnected ? "connected" : "disconnected",
        env: process.env.NODE_ENV
    });
})

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found', message: 'The requested resource does not exist' });
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
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    });
});

// Initialize and export
await initializeServer();

// For local development
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
}

export default app;
