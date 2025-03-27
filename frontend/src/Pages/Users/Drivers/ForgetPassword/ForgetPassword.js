import { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/driver-forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      setSuccess("Password reset link has been sent to your email");
      setEmail("");
    } catch (error) {
      setError(error.message || "An error occurred while sending the reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="card-header">
          <h2>Forgot Password</h2>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={isLoading}
                required
                aria-describedby={error ? "error-message" : undefined}
              />
              <svg 
                className="email-icon" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
            </div>
          </div>

          {error && (
            <div className="alert error" role="alert" id="error-message">
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
            disabled={isLoading || !email}
            className="submit-button"
          >
            {isLoading ? (
              <>
                <svg className="spinner" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
                Sending...
              </>
            ) : (
              "Send Reset Link"
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

        .forgot-password-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .forgot-password-card {
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

        .forgot-password-form {
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
          padding: 0.75rem 1rem 0.75rem 2.5rem;
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

        .email-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1rem;
          height: 1rem;
          color: #6b7280;
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
          .forgot-password-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;