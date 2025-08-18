// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App.jsx';
import HomeScreen from './components/HomeScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import ChipDashboard from './components/ChipDashboard.jsx';
import GameOverScreen from './components/GameOverScreen.jsx'; // 1. Import the new component
import './index.css';

// Define the application's routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HomeScreen />,
      },
      {
        path: "/game/:gameId",
        element: <GameScreen />,
      },
      {
        path: "/dashboard",
        element: <ChipDashboard />,
      },
      { // 2. Add the new route for the game over screen
        path: "/game/:gameId/over",
        element: <GameOverScreen />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
