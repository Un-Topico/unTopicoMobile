import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
const firebaseConfig = {
  apiKey: "AIzaSyDhg9ot1wlOiRGkSYQ-T6pXgaHZpxpOHjU",
  authDomain: "untopico-b888c.firebaseapp.com",
  projectId: "untopico-b888c",
  storageBucket: "untopico-b888c.appspot.com",
  messagingSenderId: "950143679973",
  appId: "1:950143679973:web:ff670f049fa787286d830c",
  measurementId: "G-KNYD12D1NX"
};
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});


export { app, auth };