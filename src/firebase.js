// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// --- CHANGE IS HERE ---
// Import the necessary functions for authentication
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

// Your web app's Firebase configuration, using the .env variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// --- AND CHANGE IS HERE ---
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Automatically sign in the user anonymously when the app loads
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        console.log("User is signed in with UID:", user.uid);
    } else {
        // User is signed out, so sign them in anonymously
        signInAnonymously(auth).catch((error) => {
            console.error("Error signing in anonymously:", error);
        });
    }
});
