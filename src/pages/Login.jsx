import { useState } from "react";
import { Calendar } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google"; // changed import here
import { Link, useNavigate } from "react-router-dom";
import { verifyUser } from "../services/api";

import "./styles/Login.css";

export default function LoginPage() {

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState({
    google: false,
    microsoft: false,
  });

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      setIsLoading((prev) => ({ ...prev, google: true }));

      const idToken = credentialResponse.credential;

      // Store in localStorage for later use
      localStorage.setItem("token", idToken);

      // add a dashboard sekeleton while we are loading
      // Verify token with your Flask backend
      const res = await verifyUser(idToken);

      

      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsLoading((prev) => ({ ...prev, google: false }));
    }
  };

  return (
    <>
      <div className="login-container">
        <div className="login-card-wrapper">
          <div className="app-branding">
            <div className="app-icon">
              <Calendar size={48} />
            </div>
            <h1 className="app-title">ScheduLy.com</h1>
            <p className="app-subtitle">Sign in to access your calendar</p>
          </div>

          <div className="login-card">
            <div className="social-buttons">
              {isLoading.google ? (
                <div className="spinner"></div>
              ) : (
                <GoogleLogin
                  onSuccess={handleLoginSuccess}
                  onError={() => console.log("Google login failed")}
                />
              )}

              <button
                disabled={isLoading.google || isLoading.microsoft}
                className="social-button"
              >
                {isLoading.microsoft ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <svg
                      className="social-icon"
                      width="20"
                      height="20"
                      viewBox="0 0 23 23"
                    >
                      <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                    Sign in with Microsoft (coming soon)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Link to="/dashboard">Go to Dashboard</Link>
    </>
  );
}
