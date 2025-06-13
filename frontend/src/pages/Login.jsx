import config from '../config';
import { useEffect, useState } from 'react';

/**
 * LoginPage component - handles user authentication through:
 * - Username/password login form with validation
 * - OAuth login options for Google and Microsoft (currently disabled)
 *
 * Features:
 * - Form validation with error messages
 * - Field-level error tracking
 * - Submit error handling
 * - JWT token storage
 */
const LoginPage = () => {
  // Form field states
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

  // Form validation states
  const [formValid, setFormValid] = useState(false);
  const [formErrors, setFormErrors] = useState({ username: '', password: '' });
  const [submitError, setSubmitError] = useState('');

  // Track if fields have been interacted with
  const [touched, setTouched] = useState({ username: false, password: false });

  // Set page title on component mount
  useEffect(() => {
    document.title = 'Login | OAuth Demo';
  }, []);

  /**
   * Validates form fields and updates error states whenever fields change
   * Checks:
   * - Username length (3-100 chars)
   * - Password length (6-100 chars)
   */
  useEffect(() => {
    const errors = {
      username:
        username.length < 3
          ? 'Username must be at least 3 characters'
          : username.length > 100
            ? 'Username must be at most 100 characters'
            : '',
      password:
        password.length < 6
          ? 'Password must be at least 6 characters'
          : password.length > 100
            ? 'Password must be at most 100 characters'
            : '',
    };

    setFormErrors(errors);
    setFormValid(!errors.username && !errors.password);
  }, [username, password]);

  /**
   * Redirects to Google OAuth login endpoint
   */
  const handleLoginGoogle = () => {
    window.location.href = `${config.API_URL}/auth/google`;
  };

  /**
   * Redirects to Microsoft OAuth login endpoint
   */
  const handleLoginMicrosoft = () => {
    window.location.href = `${config.API_URL}/auth/microsoft`;
  };

  /**
   * Handles form submission:
   * 1. Prevents default form behavior
   * 2. Clears any previous submit errors
   * 3. Makes API call to login endpoint
   * 4. On success: stores JWT token and redirects to chat
   * 5. On failure: displays error message
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    try {
      const response = await fetch(`${config.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      // Try to get accessToken from response
      const data = await response.json().catch(() => null);
      if (data && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      // Redirect to chat page after successful login
      window.location.href = '/chat';
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  return (
    <div className="page login-page">
      <div className="card">
        <h1>Welcome</h1>
        <p>Sign in to access the system</p>
        <div>
          <form onSubmit={handleSubmit}>
            {/* Display submit error if any */}
            {submitError && (
              <p style={{ color: 'red', marginBottom: '1rem' }}>
                {submitError}
              </p>
            )}
            {/* Username input field */}
            <input
              type="text"
              placeholder="eg. email@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
              required
              className="input-style"
            />

            {/* Username validation error message */}
            {formErrors.username && touched.username && (
              <p
                style={{
                  color: 'red',
                  fontSize: '0.85rem',
                  marginTop: '-0.8rem',
                  marginBottom: '1rem',
                }}
              >
                {formErrors.username}
              </p>
            )}

            {/* Password input field */}
            <input
              type="password"
              placeholder="eg. email@example.com123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              required
              className="input-style"
            />

            {/* Password validation error message */}
            {formErrors.password && touched.password && (
              <p
                style={{
                  color: 'red',
                  fontSize: '0.85rem',
                  marginTop: '-0.8rem',
                  marginBottom: '1rem',
                }}
              >
                {formErrors.password}
              </p>
            )}

            {/* Submit button - disabled when form is invalid */}
            <button
              className={`button ${!formValid ? 'disabled' : ''}`}
              type="submit"
              disabled={!formValid}
            >
              Log In
            </button>
          </form>
        </div>
        {/* OAuth login options - currently disabled */}
        {false && (
          <>
            <hr />
            <p>
              <button className="button" onClick={handleLoginGoogle}>
                Login with Google
              </button>
            </p>
            <p>
              <button className="button" onClick={handleLoginMicrosoft}>
                Login with Microsoft
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
export default LoginPage;
