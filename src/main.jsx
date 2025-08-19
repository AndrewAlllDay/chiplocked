// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css';

// Import all necessary components
import HomeScreen from './components/HomeScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import ChipDashboard from './components/ChipDashboard.jsx';
import GameOverScreen from './components/GameOverScreen.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeScreen />,
  },
  {
    path: "/dashboard",
    element: <ChipDashboard />,
  },
  {
    path: "/game/:gameId",
    element: <GameScreen />,
  },
  {
    path: "/game/:gameId/over",
    element: <GameOverScreen />,
  },
]);

// This is a direct and robust way to create the root
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);