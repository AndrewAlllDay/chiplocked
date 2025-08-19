// src/App.jsx

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { auth } from './firebase'; // Import the auth service
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      // Regardless of whether a user is found or not, authentication is complete.
      // This ensures the loading screen is dismissed immediately.
      setIsAuthenticating(false);
    });

    // Clean up the subscription when the component unmounts
    return unsubscribe;
  }, []);

  // While authenticating, show a loading screen
  if (isAuthenticating) {
    return (
      <div className="bg-slate-900 text-white min-h-screen flex justify-center items-center">
        <h1 className="text-3xl font-bold">Connecting to Game...</h1>
      </div>
    );
  }

  // Once authenticated, show the rest of the app
  return (
    <div className="App">
      <Outlet />
    </div>
  );
}

export default App;