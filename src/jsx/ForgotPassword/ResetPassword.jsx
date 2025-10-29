import React, { useState } from "react";
import backButton from '../../assets/back-button.png';

const ResetPassword = ({ onSubmit }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password) {
      onSubmit(password);
    }
  };

  return (
    <>
      <div className="back-button-container">
        <button>
          <img src={backButton} />
        </button>
      </div>
      <div className="login-right-text">
        <h2>Reset Password</h2>
        <p>Please enter your new password.</p>
        <form onSubmit={handleSubmit}>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="password-input"
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button type="submit" className="continue-btn">
            Continue
          </button>
        </form>
      </div>
    </>
  );
};

export default ResetPassword;