import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is not defined');
        }
        
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(process.env.MONGO_URI, options);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection error:", error);
        // Don't throw, return false to indicate failure
        return false;
    }
    return true;
}