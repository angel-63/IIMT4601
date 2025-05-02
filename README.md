# IIMT4601
# Chiu Luen Minibus App

A mobile application for Chiu Luen Light Bus Operation that allows users to view real-time schedules, make reservations, and receive automated push notifications and GPS-based nearest-stop suggestions. Built with the MERN stack and Expo, this project streamlines booking, reduces no-shows, and enhances the passenger experience.

## Features

* **Real-Time Schedule**: Browse up-to-date arrival times for all routes.
* **Reservation**: Reserve online for seats before the journey. 
* **Push Notifications**:
  * Reservation reminder: 15 minutes before departure. 
  * Arrival reminder: up to 15 minutes before pickup at the nearest stop.
* **GPS Integration**:
  * Tracks user location (with permission) to auto-select the nearest stop.
  * Displays ETA for the nearest stop on the schedule page.
* **User Settings**: Toggle global and per-notification-type preferences.
* **Quick Book**: Re-book a previous trip with one tap, pre-filling all details except date.

## Technology Stack

* **Backend**: Node.js, Express, MongoDB, Mongoose
* **Frontend**: React Native (Expo), Expo Router
* **Notifications**: Expo Push Notifications, Axios for API calls
* **Location**: Expo Location, React Native Maps

## Prerequisites

* **Node.js** v16+ and **npm**
* **Expo CLI**
* **Xcode** (for iOS Simulator) or **Android Studio** (for Android Emulator)
* **MongoDB Atlas** or local MongoDB for development

## Environment Variables

Create a `.env` file in the project root with:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mydb
API_BASE_DEV=http://<YOUR_LAN_IP>:3000
API_BASE_PROD=https://your-production-api.com
EXPO_PUSH_SERVER_KEY=<your_expo_push_key>
```

## Installation

```bash
# Clone repo
git clone https://github.com/angel-63/IIMT4601
cd IIMT4601

# Install dependencies (use legacy peer deps to avoid conflicts)
npm install
```

## Running the Server Locally

```bash
npm run server
# ensure it listens on 0.0.0.0:3000
```

## Running the Mobile App

1. **Start Metro**:

   ```bash
   npm start // npm expo run:ios --device
   ```
2. **iOS Simulator**: press `i` or click **Run on iOS simulator** in Expo DevTools.
3. **Android Emulator**: press `a` or click **Run on Android device/emulator**.
4. **Physical Device**: scan the QR code with Expo Go (ensure same network or use `--tunnel`).


## Folder Structure

```bash
├── app               # Expo Router screens & layouts
│   ├── (tabs)
│   │   ├── _layout.tsx  # Tab navigator + useLocation hook
│   │   ├── schedule    # Schedule screens
│   │   ├── reservation # Reservation & Quick Book screens
│   │   └── profile     # Profile & Settings screens
├── hooks
│   └── useLocation.ts # GPS permission & tracking hook
├── server            # Express API
│   ├── models        # Mongoose schemas
│   ├── routes        # Reservation, user, notification endpoints
│   └── server.ts     # App entrypoint
├── utils             # Shared utilities (nearest-stop, date helpers)
├── config-api.ts     # API_BASE config based on __DEV__
└── README.md         # This file
```

## Troubleshooting

* **Network Error on device**: ensure `API_BASE_DEV` points to your computer’s LAN IP and server listens on `0.0.0.0`. Use `expo start --lan` or `--tunnel`.
* **Peer dependency errors**: run `npm install --legacy-peer-deps`.
* **Push token not showing**: test on a physical device and `console.log` the token in `notificationHandler.ts`.

## Contact

For questions or feedback, please reach out to LUK Sin Yu, Angel at [angelluk@connect.hku.hk](mailto:angelluk@connect.hku.hk) or WONG Kwan Lam, Vanessa at [vanwongg@connect.hku.hk] (mailto:vanwongg@connect.hku.hk). 
