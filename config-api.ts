// import { NetworkInfo } from 'react-native-network-info';


// // Get the device's IP and build the API_BASE
// const getAPIBase = async () => {
//     try {
//         const deviceIP = await NetworkInfo.getIPAddress();
//         console.log("API Base:", deviceIP);
//         return `http://${deviceIP}:3001`; // Backend port is 3001
//     } catch (error) {
//         console.warn('Failed to detect IP. Falling back to localhost.');
//         return 'http://localhost:3001'; // Fallback for emulators
//     }
//   };

export const API_BASE = 'https://iimt-4601-gb7xpzwxq-angelluk63s-projects.vercel.app';