/**
 * Handles user logout by calling backend logout endpoint
 * and redirecting to the login page
 */
export function handleLogout() {
  localStorage.removeItem("accessToken");
  window.location.href = "/login";
}
