import config from "../config/index.js";
import { handleLogout } from "./logout.js";

const API_URL = config.API_URL.replace(/\/+$/, "");

export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("accessToken");

  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : undefined,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(`${API_URL}/${url.replace(/^\/+/, "")}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        handleLogout();
        // Optionally, return a rejected promise
        throw new Error("Forbidden: Redirecting to login");
      }

      // Optionally handle global errors here
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "API error");
    }

    return await response.json(); // or response.text(), etc.
  } catch (error) {
    // Centralized error logging
    console.error("API Fetch Error:", error);
    throw error;
  }
}
