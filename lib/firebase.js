import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const requiredEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[firebase] Missing required env var: ${key}`);
  }
  return value;
};

const firebaseConfig = {
  apiKey: requiredEnv("EXPO_PUBLIC_FIREBASE_API_KEY"),
  authDomain: requiredEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: requiredEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: requiredEnv("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: requiredEnv("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: requiredEnv("EXPO_PUBLIC_FIREBASE_APP_ID"),
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);