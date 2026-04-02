import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import transactionRoutes from './routes/transaction.routes';
import dashboardRoutes from './routes/dashboard.routes';
import userRoutes from './routes/user.routes';
import { seedAdminUser } from './config/seedAdmin';
import { seedDummyData } from './config/seedDummy';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware setup
app.use(helmet()); // Set various security-related HTTP headers automatically
app.use(morgan('dev')); // Log every incoming HTTP request to the terminal in a clean, readable format
app.use(cors()); // Enable CORS for all routes (allows frontend to communicate with backend)
app.use(express.json()); // Parse JSON bodies

// 1. Global API Rate Limiter
// Prevents standard API abuse (100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// 2. Strict Auth Rate Limiter
// Prevents brute-force on Login/Register (20 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts, please try again later'
});

// Apply rate limiters
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Database connection setup (basic)
// Connects to local MongoDB by default, or URI specified in .env
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI!)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    // Fire the logic layer ensuring RBAC limits load cleanly immediately post-boot
    await seedAdminUser();
    // Populate with synthetic data for visualization testing
    await seedDummyData();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes (API v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/users', userRoutes);

// Basic health check route
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Server context active and reachable (v1).' });
});

// Basic Error Handling Middleware
// Catches all errors passed to next(err)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error: Execution context crashed.' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
