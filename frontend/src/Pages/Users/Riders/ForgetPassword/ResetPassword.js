import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => navigate("/login"), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) return "Password must be at least 8 characters long";
    if (!hasUpperCase) return "Password must contain at least one uppercase letter";
    if (!hasLowerCase) return "Password must contain at least one lowercase letter";
    if (!hasNumbers) return "Password must contain at least one number";
    if (!hasSpecialChar) return "Password must contain at least one special character";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5500/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccess("Password reset successful! Redirecting to login...");
    } catch (error) {
      setError(error.message || "An error occurred while resetting password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="card-header">
          <h2>Reset Password</h2>
          <p>Please enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div className="input-wrapper">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                required
                aria-describedby="password-requirements"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div id="password-requirements" className="password-requirements">
            Password must contain:
            <ul>
              <li className={newPassword.length >= 8 ? "met" : ""}>
                At least 8 characters
              </li>
              <li className={/[A-Z]/.test(newPassword) ? "met" : ""}>
                One uppercase letter
              </li>
              <li className={/[a-z]/.test(newPassword) ? "met" : ""}>
                One lowercase letter
              </li>
              <li className={/\d/.test(newPassword) ? "met" : ""}>
                One number
              </li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? "met" : ""}>
                One special character
              </li>
            </ul>
          </div>

          {error && (
            <div className="alert error" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="alert success" role="alert">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !newPassword || !confirmPassword}
            className="submit-button"
          >
            {isLoading ? (
              <>
                <svg className="spinner" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>

      <style>{`
        :root {
          --error-color: #dc2626;
          --success-color: #16a34a;
          --text-color: #1f2937;
          --border-color: #e5e7eb;
          --background-color: #f9fafb;
          --card-background: #ffffff;
          --disabled-background: #f3f4f6;
          --disabled-text: #9ca3af;
        }

        .reset-password-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .reset-password-card {
          width: 100%;
          max-width: 28rem;
          background: var(--card-background);
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          padding: 2rem;
        }

        .card-header {
          margin-bottom: 2rem;
        }

        .card-header h2 {
          color: var(--text-color);
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .card-header p {
          color: #6b7280;
          margin: 0;
        }

        .reset-password-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: var(--text-color);
          font-weight: 500;
        }

        .input-wrapper {
          position: relative;
        }

        .input-wrapper input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: 0.375rem;
          font-size: 1rem;
          color: var(--text-color);
          transition: border-color 0.2s;
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .input-wrapper input:disabled {
          background-color: var(--disabled-background);
          color: var(--disabled-text);
          cursor: not-allowed;
        }

        .toggle-password {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b7280;
          font-size: 0.875rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
        }

        .toggle-password:hover {
          color: var(--text-color);
        }

        .password-requirements {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .password-requirements ul {
          list-style: none;
          padding-left: 0;
          margin: 0.5rem 0 0 0;
        }

        .password-requirements li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .password-requirements li::before {
          content: "×";
          color: var(--error-color);
        }

        .password-requirements li.met::before {
          content: "✓";
          color: var(--success-color);
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }

        .alert svg {
          width: 1rem;
          height: 1rem;
        }

        .alert.error {
          background-color: #fef2f2;
          color: var(--error-color);
          border: 1px solid #fecaca;
        }

        .alert.success {
          background-color: #f0fdf4;
          color: var(--success-color);
          border: 1px solid #bbf7d0;
        }

        .submit-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 0.375rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .submit-button:hover:not(:disabled) {
          background-color: #1d4ed8;
        }

        .submit-button:disabled {
          background-color: var(--disabled-background);
          color: var(--disabled-text);
          cursor: not-allowed;
        }

        .spinner {
          width: 1rem;
          height: 1rem;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 640px) {
          .reset-password-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;