# IIMT4601
# Chiu Luen Minibus App

A mobile application for Chiu Luen Light Bus Operation that allows users to view real-time schedules and make reservations. Built with the MERN stack and Expo, this project streamlines booking, improve information transparency and enhances the passenger experience. 

## Features

* **Real-Time Schedule**: 
  * Browse up-to-date arrival times for all routes.
  * Bookmark your regular route. 
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
* **Map**: OpenStreetMap (OSM), Open Source Routing Machine (ORSM)
* **Hosting**: Vercel

## Prerequisites

* **Node.js** v16+ and **npm**
* **Expo CLI**
* **Xcode** (for iOS Simulator) [Recommended] or **Android Studio** (for Android Emulator)
* **MongoDB Atlas** or local MongoDB for development

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
```

## Running Real-Time Estimation Computation (Back-end)

1. **Install Required Libraries**:

   ```bash
   pip install pymongo==4.12.0
   pip install pytz==2023.3.post1
   ```
2. **Check Python Version**:

   ```bash
   # 3.11.5 is recommended
   python3 --version
   ```
3. **Open 2 Separate Terminals and Start Scripts**: Do not reuse the terminal used for Step 1 and Step 2.

   ```bash
   # On first terminal
   python3 generation.py

   # On second terminal
   python3 estimation.py
   ```
   **In Case of Unexpected Termination**:
   Repeat Step 3.
   Cold start problem exist and may occur occasionally.


## Running the Mobile App

### Method 1: Expo Go [Recommended]
1. **Start Metro**:

   ```bash
   npm start // npm expo run:ios --device
   ```
2. **iOS Simulator**: press `i` or click **Run on iOS simulator** in Expo DevTools.
3. **Android Emulator**: press `a` or click **Run on Android device/emulator**.

### Method 2: Development build (for iOS Simulator only)
1. **Start Metro**:

   ```bash
   npm expo run:ios --device
   ```
2. **Open build**: Click on the downloaded app icon on the simulator. 

## Contact

For questions or feedback, please reach out to LUK Sin Yu, Angel at [angelluk@connect.hku.hk](mailto:angelluk@connect.hku.hk) or WONG Kwan Lam, Vanessa at [vanwongg@connect.hku.hk](mailto:vanwongg@connect.hku.hk). 
