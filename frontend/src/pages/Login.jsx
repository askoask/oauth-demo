import config from "../config";
import {useEffect, useState} from "react";

/**
 * LoginPage component - renders the login screen with a Google login button.
 */
const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [formValid, setFormValid] = useState(false);
    const [formErrors, setFormErrors] = useState({username: "", password: ""});
    const [submitError, setSubmitError] = useState("");
    const [touched, setTouched] = useState({username: false, password: false});

    // Set document title when component mounts
    useEffect(() => {
        document.title = "Login | OAuth Demo";
    }, []);

    // Validate form fields whenever they change
    useEffect(() => {
        const errors = {
            username:
                username.length < 3
                    ? "Username must be at least 3 characters"
                    : username.length > 100
                        ? "Username must be at most 100 characters"
                        : "",
            password:
                password.length < 6
                    ? "Password must be at least 6 characters"
                    : password.length > 100
                        ? "Password must be at most 100 characters"
                        : "",
        };

        setFormErrors(errors);
        setFormValid(!errors.username && !errors.password);
    }, [username, password]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");

        try {
            const response = await fetch(`${config.API_URL}/auth/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, password}),
                credentials: "include", // Include cookies for authentication
            });

            if (!response.ok) {
                throw new Error("Invalid credentials");
            }

            // const data = await response.json();
            // Save the token or session data
            // localStorage.setItem("token", data.token);
            // Redirect or update UI
            window.location.href = "/profile";
        } catch (err) {
            setSubmitError(err.message);
        }
    };

    // Redirect user to Google OAuth login
    const handleLoginGoogle = () => {
        window.location.href = `${config.API_URL}/auth/google`;
    };
    
    return (
        <div className="page login-page">
            <div className="card">
                <h1>Welcome</h1>
                <p>Sign in to access your profile</p>
                <div>
                    <form onSubmit={handleSubmit}>
                        {submitError && (
                            <p style={{color: "red", marginBottom: "1rem"}}>
                                {submitError}
                            </p>
                        )}
                        <input
                            type="text"
                            placeholder="eg. test@example.com"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onBlur={() => setTouched((prev) => ({...prev, username: true}))}
                            required
                            className="input-style"
                        />

                        {formErrors.username && touched.username && (
                            <p
                                style={{
                                    color: "red",
                                    fontSize: "0.85rem",
                                    marginTop: "-0.8rem",
                                    marginBottom: "1rem",
                                }}
                            >
                                {formErrors.username}
                            </p>
                        )}

                        <input
                            type="password"
                            placeholder="eg. test123"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => setTouched((prev) => ({...prev, password: true}))}
                            required
                            className="input-style"
                        />

                        {formErrors.password && touched.password && (
                            <p
                                style={{
                                    color: "red",
                                    fontSize: "0.85rem",
                                    marginTop: "-0.8rem",
                                    marginBottom: "1rem",
                                }}
                            >
                                {formErrors.password}
                            </p>
                        )}

                        <button
                            className={`button ${!formValid ? "disabled" : ""}`}
                            type="submit"
                            disabled={!formValid}
                        >
                            Log In
                        </button>
                    </form>
                </div>
                <hr/>
                <p>
                    <button className="button" onClick={handleLoginGoogle}>
                        Login with Google
                    </button>
                </p>
            </div>
        </div>
    );
};
export default LoginPage;
