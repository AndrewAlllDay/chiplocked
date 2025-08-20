// src/firebase.js
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
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

// Initialize Firestore with settings for offline persistence
// This new syntax replaces the deprecated db.settings() method
export const db = initializeFirestore(app, {
    cache: {
        // Specify a cache size and use `indexedDb` as the storage type
        persistence: "indexedDb",
    }
});

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Automatically sign in the user anonymously when the app loads
// A single check is sufficient to prevent a sign-in loop
if (!auth.currentUser) {
    signInAnonymously(auth).catch((error) => {
        console.error("Error signing in anonymously:", error);
    });
}

// The onAuthStateChanged listener is now used for logging and reacting to state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in with UID:", user.uid);
    } else {
        console.log("User is signed out.");
    }
});
