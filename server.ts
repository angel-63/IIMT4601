import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt'; 
import Route from './models/Route';
import Stop from './models/Stop';
import User from './models/User';

// Initialize Express
const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(cors({
    // origin: [
    //   'exp://192.168.3.31:8081', // Your Expo URL
    //   'exp://10.68.233.56:8081',
    //   'http://localhost:8081',   // Expo web
    //   'http://192.168.3.31:8081' // Local network
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

// POST new user
app.post('/api/signup', async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, name, phone, cardInfo } = req.body;
    if (!email || !password || !name || !phone) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `USER${String(Date.now()).slice(-3)}`;
    const newUser = new User({
      user_id: userId,
      name,
      email,
      phone,
      password: hashedPassword,
      trip_history: [],
      bookmarked: [],
      cardInfo: cardInfo || undefined,
    });

    await newUser.save();
    res.json({ success: true, userId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, message });
  }
});

// POST current users credentials
app.post('/api/login', async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Missing email or password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({ success: true, userId: user.user_id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, message });
  }
});

// GET user data by userId
app.get('/user/:userId', async (req: express.Request, res: express.Response) => {
  try {
    const { userId } = req.params;
    console.log('Querying user with user_id:', userId);
    const user = await User.findOne(
      { user_id: { $regex: `^${userId}$`, $options: 'i' } },
      { password: 0 }
    );
    if (!user) {
      console.log('User not found for user_id:', userId);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log('Found user:', user);
    res.json({ success: true, user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, message });
  }
});

// PUT update user data by userId
app.put('/user/:userId', async (req: express.Request, res: express.Response) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, password } = req.body;

    const updateData: any = { name, email, phone };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findOneAndUpdate(
      { user_id: { $regex: `^${userId}$`, $options: 'i' } },
      { $set: updateData },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, message });
  }
});

// POST toggle bookmark for a user
app.post('/user/:userId/bookmark', async (req: express.Request, res: express.Response) => {
  try {
    const { userId } = req.params;
    const { routeId } = req.body;

    if (!routeId) {
      return res.status(400).json({ success: false, message: 'Missing routeId' });
    }

    const user = await User.findOne({ user_id: { $regex: `^${userId}$`, $options: 'i' } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const bookmarked = user.bookmarked || [];
    const index = bookmarked.indexOf(routeId);
    if (index === -1) {
      bookmarked.push(routeId); // Add to bookmarks
    } else {
      bookmarked.splice(index, 1); // Remove from bookmarks
    }

    await User.updateOne(
      { user_id: { $regex: `^${userId}$`, $options: 'i' } },
      { $set: { bookmarked } }
    );

    res.json({ success: true, bookmarked });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, message });
  }
});

// POST card info update
app.post('/user/:userId/payment', async (req, res) => {
  const { userId } = req.params;
  const { cardInfo } = req.body; // Changed from paymentDetails to cardInfo

  try {
    // Validate input
    if (!cardInfo || typeof cardInfo !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid card info' });
    }

    // Update or create the user with the new card info
    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId }, // Changed to user_id to match schema
      { $set: { cardInfo } },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Card info updated successfully', data: updatedUser.cardInfo });
  } catch (error) {
    console.error('Error updating card info:', error);
    res.status(500).json({ success: false, message: 'Failed to update card info' });
  }
});

// POST settings update
app.post('/user/:userId/settings', async (req, res) => {
  const { userId } = req.params;
  const { settings } = req.body;

  try {
    // Validate input
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid settings' });
    }

    // Update or create the user with the new settings
    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId }, // Changed to user_id to match schema
      { $set: { settings } },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Settings updated successfully', data: updatedUser.settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

// Log all registered routes for debugging
app._router.stack.forEach((middleware: any) => {
  if (middleware.route) {
    console.log('Registered route:', middleware.route.path);
  }
});