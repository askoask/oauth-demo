import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config/index.js";
import { fetchWithAuth } from "../utils/apiCLient.js";
import { handleLogout } from "../utils/logout.js";
/**
 * ProfilePage component - displays the authenticated user's profile information
 * Handles fetching profile data, displaying loading state, and logout functionality
 */
const ProfilePage = () => {
  const [user, setUser] = useState(null); // Holds user profile data after fetching
  const navigate = useNavigate(); // React Router hook for programmatic navigation

  // Set page title and fetch profile data when the component initially mounts
  useEffect(() => {
    document.title = "Profile | OAuth Demo";
    fetchProfile();
  }, []);

  /**
   * Fetches the user's profile data from the backend API
   * Redirects to the login page if not authenticated or on error
   */
  const fetchProfile = async () => {
    try {
      const data = await fetchWithAuth(`/profile`);
      setUser(data); // Update state with user data
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      navigate("/login"); // Redirect to log in on network/server errors
    }
  };

  // Show loading state while fetching user data
  if (!user) {
    return (
      <div className="page loading-page">
        <div>Loading profile...</div>
      </div>
    );
  }

  // Render user profile information once data is loaded
  return (
    <div className="page profile-page">
      <div className="card profile-card">
        {user.picture ? (
          <img src={user.picture} alt="Profile" className="avatar" />
        ) : (
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="#ddd"
              stroke="#ccc"
              stroke-width="4"
            />
            <circle cx="50" cy="35" r="15" fill="#bbb" />
            <path d="M20 80c0-15 15-25 30-25s30 10 30 25" fill="#bbb" />
          </svg>
        )}
        <h2>{user.name}</h2>
        <p className="email">{user.email}</p>
        <div className="info">
          <div>
            <strong>Given Name:</strong> {user.given_name}
          </div>
          <div>
            <strong>Family Name:</strong> {user.family_name}
          </div>
        </div>
        <button className="button logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
