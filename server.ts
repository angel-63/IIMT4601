import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Route from './models/Route';
import Stop from './models/Stop';

// Initialize Express
const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(cors({
    // origin: [
    //   'exp://192.168.1.78:8081', // Your Expo URL
    //   'exp://10.68.233.56:8081',
    //   'http://localhost:19000',   // Expo web
    //   'http://192.168.1.78:19000' // Local network
    // ]
  }));

// Connect to MongoDB
const uri = "mongodb+srv://aileen:Enha0420@4601sprint1.9qmij.mongodb.net/user";

mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error: Error) => console.error('MongoDB connection error:', error.message));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// GET route list
app.get("/routes", async (req: express.Request, res: express.Response) => {
  try {
    const routes = await Route.find({});
    res.status(200).json(routes);
    console.log('Found routes:', routes);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message });
  }
});

// GET specific route details
app.get("/routes/:routeId", async (req: express.Request, res: express.Response) => {
  try {
    const {routeId} = req.params;
    console.log('req:', routeId);
    const route = await Route.findOne({route_id: routeId});
    if (!route) {
      res.status(404).json({ message: 'Route not found' });
    } else {
      res.status(200).json(route);
      console.log('Found route:', route);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message });
  }
});

// GET specific stop details
app.get("/stops/:stopId", async (req: express.Request, res: express.Response) => {
  try {
    const {stopId} = req.params;
    console.log('req:', stopId);
    const stop = await Stop.findOne({stop_id: stopId});
    if (!stop) {
      res.status(404).json({ message: 'Stop not found' });
    } else {
      res.status(200).json(stop);
      console.log('Found stop:', stop);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message });
  }
});

// GET specific stop details
app.get("/stops/:stopId", async (req: express.Request, res: express.Response) => {
  try {
    const {stopId} = req.params;
    console.log('req:', stopId);
    const stop = await Stop.findOne({stop_id: stopId});
    if (!stop) {
      res.status(404).json({ message: 'Stop not found' });
    } else {
      res.status(200).json(stop);
      console.log('Found stop:', stop);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message });
  }
});

/*
// Bulk stops endpoint
app.get('/stops/bulk', async (req: express.Request, res: express.Response) => {
  try {
    const stopIdsParam = req.query.stopIds;
    if (!stopIdsParam || typeof stopIdsParam !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid stopIds parameter' });
    }

    // Parse JSON array of stop IDs
    const stopIds = JSON.parse(stopIdsParam);
    if (!Array.isArray(stopIds)) {
      return res.status(400).json({ message: 'stopIds must be a JSON array' });
    }

    // Convert to strings and remove duplicates
    const uniqueStopIds = [...new Set(stopIds.map(id => String(id)))];

    // Find stops in database
    const stops = await Stop.find({stop_id: { $in: uniqueStopIds }}, { _id: 0, __v: 0 });

    if (stops.length === 0) {
      return res.status(404).json({ message: 'No stops found' });
    }

    res.status(200).json({
      found: stops.length,
      results: stops
    });

  } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
  }
});
*/