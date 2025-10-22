import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blogRoutes.js';

//load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT;

//middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

//health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: "OK",
        message: 'Blog API is running',
        timestamp: new Date().toISOString()
    });
});

//routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// adtabase connection 
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

    } catch (error) {
        console.error('Database connection error: ', error.message);
        process.exit(1);

    }
};

//eror handling middleware
app.use((error, req, res, next) => {
    console.log('error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : error
    });
});

//404 hander
app.use(
    (req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found",
        //path: req.originalUrl
    });
});

//server startup
const startServer = async () => {
    await connectDB();

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode, port: ${PORT}`);

    });

    //new technologia
    process.on('SIGTERM', () => {
        console.log('SIGTERM recieved, shutting down gracefully');
        server.close(() => {
            mongoose.connection.close();
            process.exit(0);
        });

    });

    // new technologia
    process.on('SIGINT', () => {
        console.log('SIGINT received, shutting down gracefully');
        server.close(() => {
            mongoose.connection.close();
            process.exit(0);
        });
    });

    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully');
        server.close(() => {
            mongoose.connection.close();
            process.exit(0);
        });
    });

};

//start the application
startServer().catch(console.error);
