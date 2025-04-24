import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt'; 
import axios from 'axios';
import Route from './models/Route';
import Stop from './models/Stop';
import User from './models/User';
import Reservation from './models/Reservation';
import Notification from './models/Notification';
import Shift from './models/Shift';

interface ReservationQuery {
  user_id?: string;
  reservation_id?: string;  // optional
  reservation_status?: string;  // optional
  date?: { $gte: Date };  // optional
}

// Initialize Express
const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(cors({ origin: true
    // origin: [
    //   'exp://192.168.1.78:8081', // Your Expo URL
    //   'http://localhost:19000',   // Expo web
    //   'http://192.168.1.78:19000' // Local network
    // ]
  }));

// Connect to MongoDB
const uri = "mongodb+srv://aileen:Enha0420@4601sprint1.9qmij.mongodb.net/user";

mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error: Error) => console.error('MongoDB connection error:', error.message));

  // Function to send push notification via Expo
async function sendPushNotification(pushToken: string, message: string) {
  try {
    await axios.post('https://exp.host/--/api/v2/push/send', {
      to: pushToken,
      sound: 'default',
      title: 'Minibus Reservation',
      body: message,
      data: { type: 'reservation' },
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`Push notification sent to ${pushToken}`);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

// Function to generate notifications based on reservation
async function generateNotifications(reservation: any, userId: string) {
  const user = await User.findOne({ user_id: userId });
  if (!user || !user.settings?.notificationsEnabled) return;

  const reservationTime = new Date(reservation.date);
  const notifications: any[] = [];

  // 1. Reservation Reminder (15 minutes before)
  if (user.settings.reservationReminder) {
    const reminderTime = new Date(reservationTime.getTime() - 15 * 60 * 1000);
    notifications.push({
      reservation_id: reservation.reservation_id,
      user_id: userId,
      message: "Your reservation is in 15 minutes.",
      send_time: reminderTime,
      type: 'ReservationReminder',
      status: 'Pending',
    });
  }

  // 2. Allocated Shift Reminder (when shift_id is assigned)
  if (user.settings.allocatedShiftReminder && reservation.shift_id) {
    notifications.push({
      reservation_id: reservation.reservation_id,
      user_id: userId,
      message: "Your reservation has been assigned a shift.",
      send_time: new Date(), // Send immediately
      type: 'AllocatedShiftReminder',
      status: 'Pending',
    });
  }

  // 3. Reserved Seat Reminder (xx minutes before arrival)
  if (user.settings.reservedSeatReminder && reservation.shift_id) {
    const route = await Route.findOne({ route_id: reservation.route_id });
    if (route && route.stops) {
      const stop = route.stops.find((s: { stop_id: any; }) => s.stop_id === reservation.pickup_location);
      if (stop && stop.arrival_times.length > 0) {
        const arrivalTimeStr = stop.arrival_times.find((time: string | any[]) => time.includes(reservation.shift_id));
        if (arrivalTimeStr) {
          const arrivalTime = new Date(`${reservation.date.toISOString().split('T')[0]}T${arrivalTimeStr}+08:00`);
          const minutesBefore = Math.min(user.settings.reservedSeatReminderBeforeMinutes || 15, 15);
          const reminderTime = new Date(arrivalTime.getTime() - minutesBefore * 60 * 1000);
          notifications.push({
            reservation_id: reservation.reservation_id,
            user_id: userId,
            message: `Your minibus is arriving in ${minutesBefore} minutes at ${reservation.pickup_location}.`,
            send_time: reminderTime,
            type: 'ReservedSeatReminder',
            status: 'Pending',
          });
        }
      }
    }
  }

  // Save notifications to database
  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
    console.log(`Generated ${notifications.length} notifications for reservation ${reservation.reservation_id}`);
  }
}

// Background task to check and send notifications
async function startNotificationScheduler() {
  setInterval(async () => {
    const now = new Date();
    const notifications = await Notification.find({
      status: 'Pending',
      send_time: { $lte: now },
    });

    for (const notification of notifications) {
      const user = await User.findOne({ user_id: notification.user_id });
      if (user && user.pushToken) {
        await sendPushNotification(user.pushToken, notification.message);
        notification.status = 'Sent';
        await notification.save();
      } else {
        notification.status = 'Failed';
        await notification.save();
        console.log(`No push token for user ${notification.user_id}`);
      }
    }
  }, 60 * 1000); // Check every minute
}

// Start the scheduler
startNotificationScheduler();

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
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`; // Log full URL
    console.log('Requested URL:', fullUrl);
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

// GET shifts for a route
app.get("/shifts/:routeId", async (req: express.Request, res: express.Response) => {
  try {
    const { routeId } = req.params;
    console.log('Fetching shifts for route_id:', routeId);

    // Fetch shifts for the given route_id
    const shifts = await Shift.find({ route_id: routeId }).lean();
    if (!shifts || shifts.length === 0) {
      return res.status(404).json({ message: 'No shifts found for this route' });
    }

    // For each shift, construct the next stop_id and fetch the stop name
    const shiftsWithStopNames = await Promise.all(shifts.map(async (shift) => {
      // Construct stop_id in format ROUTE1-012
      const stopId = `${shift.route_id.toUpperCase()}-${String(shift.progress).padStart(3, '0')}`;
      let nextStationName = 'Unknown';

      // Fetch stop details
      const stop = await Stop.findOne({ stop_id: stopId });
      if (stop) {
        nextStationName = stop.name || 'Unknown';
      } else {
        console.log(`Stop not found for stop_id: ${stopId}`);
      }

      return {
        busNumber: shift.minibus_id,
        nextStation: nextStationName,
      };
    }));

    res.status(200).json({
      message: 'Shifts retrieved successfully',
      shifts: shiftsWithStopNames,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error fetching shifts:', message);
    res.status(500).json({ message });
  }
});

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
    const { name, email, phone, password, pushToken } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (pushToken) updateData.pushToken = pushToken;

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

// POST reservation
app.post('/reservations', async (req, res) => { 
  try { 
    const { route_id, date, time, seat, pickUp, dropOff, user_id } = req.body;

    if (!route_id || 
      !date || 
      !time || 
      !seat || 
      !pickUp || 
      !dropOff || 
      !user_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const dateTimeString = `${date}T${time}:00+08:00`;
    const dateObj = new Date(dateTimeString);
    console.log(dateObj);

    const id = Math.floor(10000000 + Math.random() * 90000000);

    const reservation = new Reservation({
      status: "Reserved",
      date: dateObj,
      pickup_location: pickUp,
      dropoff_location: dropOff,
      seat,
      reservation_id: id,
      reservation_status: "Reserved",
      user_id, 
      trip_id: id,
      payment_status: "Pending",
      route_id,      
    });
    
    await reservation.save();
    
    await generateNotifications(reservation, user_id);
    res.status(201).json({ 
      message: 'Reservation created successfully',
      reservation, 
      reservation_id: reservation.reservation_id
    });
    
    } catch (error: unknown) { 
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message });
  } 
});

// GET reservation details based on userID or reservation ID
app.get('/reservations', async (req, res) => {
  try {
    const { user_id, reservation_id, reservation_status, date_gte } = req.query as { user_id?: string; reservation_id?: string; reservation_status?: string; date_gte?: Date };

    // Validate query parameters
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Build query
    const query: ReservationQuery = {};
    if (user_id) {
      query.user_id = user_id;
    }
    if (reservation_id) {
      query.reservation_id = reservation_id;
    }

    if (reservation_status) {
      query.reservation_status = reservation_status;
    }

    if (date_gte) {
      const date = new Date(date_gte);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid date_gte format' });
      }
      query.date = { $gte: date };
    }

    // Query MongoDB
    const reservations = await Reservation.find(query).lean();

    // Handle no results
    if (reservations.length === 0) {
      return res.status(404).json({ message: 'No reservations found' });
    }

    res.status(200).json({
      message: 'Reservations retrieved successfully',
      reservations,
    });
  } catch (error) {
    console.error('GET /reservations error:', error); // Improved logging
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message });
  }
});

// GET notifications for a user
app.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ user_id: userId }).sort({ send_time: -1 });
    res.status(200).json({
      message: 'Notifications retrieved successfully',
      notifications,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message });
  }
});

// PUT update reservation (e.g., when shift_id is assigned)
app.put('/reservations/:reservationId', async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { shift_id } = req.body;

    const updateData: any = {};
    if (shift_id) {
      updateData.shift_id = shift_id;
    }

    const reservation = await Reservation.findOneAndUpdate(
      { reservation_id: reservationId },
      { $set: updateData },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Generate notifications if shift_id was updated
    if (shift_id) {
      await generateNotifications(reservation, reservation.user_id);
    }

    res.status(200).json({
      message: 'Reservation updated successfully',
      reservation,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message });
  }
});

// Log all registered routes for debugging
app._router.stack.forEach((middleware: any) => {
  if (middleware.route) {
    console.log('Registered route:', middleware.route.path);
  }
});