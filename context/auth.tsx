import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useRouter, useSegments } from 'expo-router';
import axios from 'axios';

interface ICardInfo {
  number: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

interface ISettings {
  darkMode: boolean;
  locationAccessEnabled: boolean;
  notificationsEnabled: boolean;
  reservationReminder: boolean;
  reservedSeatReminder: boolean;
  allocatedShiftReminder: boolean;
  reservedSeatReminderBeforeMinutes: number;
}

interface IUser {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  trip_history: { trip_id: string; reservation_id: string }[];
  bookmarked: string[];
  cardInfo?: ICardInfo;
  settings: ISettings;
}

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
  completeSignUp: () => void;
  fetchUserData: () => Promise<void>;
  isAuthenticated: boolean;
  userId: string | null;
  user: IUser | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const BACKEND_URL = 'http://localhost:3001';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingSignUp, setPendingSignUp] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const segments = useSegments();
  const router = useRouter();

  const fetchUserData = async () => {
    if (!userId) {
      console.log('No userId available to fetch user data');
      return;
    }
    console.log('Fetching user data for userId:', userId);
    try {
      const response = await axios.get(`${BACKEND_URL}/user/${userId}`);
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        console.error('Failed to fetch user data:', response.data.message);
        if (response.status === 404) {
          setUser(null);
          setIsAuthenticated(false);
          router.replace('/(auth)/login');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setUser(null);
        setIsAuthenticated(false);
        router.replace('/(auth)/login');
      }
    }
  };

  // Delay fetchUserData until after signup transition
  useEffect(() => {
    if (userId && isAuthenticated) {
      fetchUserData();
    }
  }, [userId, isAuthenticated]);

  useEffect(() => {
    console.log('Navigation useEffect triggered:', { isAuthenticated, segments, pendingSignUp });
    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && !inAuthGroup && !pendingSignUp) {
      console.log('Redirecting to login because user is not authenticated and not in auth group');
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      console.log('Redirecting to tabs because user is authenticated and in auth group');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, router, pendingSignUp]);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/login`, { email, password });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }
      setUserId(response.data.userId);
      setIsAuthenticated(true);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      console.error('Login error full:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setUserId(null);
    setUser(null);
    router.replace('/(auth)/login');
  };

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/signup`, { email, password, name, phone });
      console.log('Signup response:', response.data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Signup failed');
      }
      setUserId(response.data.userId);
      setPendingSignUp(true);
      router.replace('/(auth)/loading-transition');
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      console.error('Signup error full:', error);
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  };

  const completeSignUp = () => {
    console.log('Executing completeSignUp, current state:', { isAuthenticated, pendingSignUp, userId });
    setIsAuthenticated(true);
    setPendingSignUp(false);
    console.log('State updated, navigating to /(tabs)');
    setTimeout(() => {
      router.push('/(tabs)');
      console.log('Navigation command executed');
    }, 100);
  };

  const contextValue = useMemo(
    () => ({
      signIn,
      signOut,
      signUp,
      completeSignUp,
      fetchUserData,
      isAuthenticated,
      userId,
      user,
    }),
    [isAuthenticated, userId, user]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};