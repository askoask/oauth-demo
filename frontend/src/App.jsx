import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

import "./App.css";
import LoginPage from "./pages/Login.jsx";
import ProfilePage from "./pages/Profile.jsx";

/**
 * App component - sets up client-side routing for the login and profile pages.
 */
const App = () => (
  <Router>
    <Routes>
      {/* Login route */}
      <Route path="/login" element={<LoginPage />} />
      {/* Profile route (protected client-side) */}
      <Route path="/profile" element={<ProfilePage />} />
      {/* Catch-all: redirect to log in */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Router>
);

export default App; // Export the main component