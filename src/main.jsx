// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App.jsx';
import HomeScreen from './components/HomeScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import ChipDashboard from './components/ChipDashboard.jsx';
import GameOverScreen from './components/GameOverScreen.jsx';
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
      {
        path: "/game/:gameId/over",
        element: <GameOverScreen />,
      },
    ],
  },
]);

// Get the root element
const rootElement = document.getElementById('root');

// Only create the root and render if the element exists and is empty
if (rootElement && !rootElement.hasChildNodes()) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
}