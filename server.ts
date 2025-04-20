import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Route from './models/Route';

// Initialize Express
const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(cors({
    origin: [
      'exp://192.168.1.78:8081', // Your Expo URL
    //   'exp://192.168.1.78:3001',
      'http://localhost:19000',   // Expo web
      'http://192.168.1.78:19000' // Local network
    ]
  }));

// Connect to MongoDB
const uri = "mongodb+srv://aileen:Enha0420@4601sprint1.9qmij.mongodb.net/user";

mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error: Error) => console.error('MongoDB connection error:', error.message));

// Route handler with proper types
app.get("/route", async (req: express.Request, res: express.Response) => {
  try {
    const routes = await Route.find({});
    res.status(200).json(routes);
    console.log('Found routes:', routes);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});