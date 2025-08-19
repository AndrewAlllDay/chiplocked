// src/App.jsx

import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import HomeScreen from './components/HomeScreen';
import AuthScreen from './components/AuthScreen';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <div className="bg-slate-900 text-white min-h-screen flex justify-center items-center">
        <h1 className="text-3xl font-bold">Connecting to Game...</h1>
      </div>
    );
  }

  // Render the appropriate screen based on authentication status
  return isAuthenticated ? <HomeScreen /> : <AuthScreen />;
}

export default App;