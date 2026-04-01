import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware setup
app.use(cors()); // Enable CORS for all routes (allows frontend to communicate with backend)
app.use(express.json()); // Parse JSON bodies

// Database connection setup (basic)
// Connects to local MongoDB by default, or URI specified in .env
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI!)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).send('Server running');
});

// Basic Error Handling Middleware
// Catches all errors passed to next(err)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
