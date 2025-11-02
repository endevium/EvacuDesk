import React, { useState } from "react";
import backButton from '../../assets/back-button.png';
import Eye from '../../assets/Eye.png';
import Eyeoff from '../../assets/Eyeoff.png';

const ResetPassword = ({ onSubmit, setStep }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password) {
      onSubmit(password);
    }
  };

  const handleShowConfirmation = () => setShowConfirmation(true);
  const handleCloseShowConfirmation = () => setShowConfirmation(false);
  const handleBackButton = () => setStep("email");

  return (
    <>
      <div className="back-button-container">
        <button onClick={() => handleShowConfirmation()}>
          <img src={backButton} />
        </button>
      </div>

      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
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
                  {showPassword ? <img src= {Eyeoff} /> : <img src= {Eye} />}
              </button>
          </div>
          <button type="submit" className="continue-btn">
            Continue
          </button>
        </form>
      </div>

      {showConfirmation && (
          <div className="confirm-logout">
              <div className="confirm-logout-body">
                  <div className="error-text">
                      <h2>Confirm Return</h2>
                      <p>You will be redirected back to the email check page. Are you sure you want to go back?</p>
                  </div>
                  <div className="buttons">
                      <button className='yes-button' onClick={() => handleBackButton()}>Yes</button>
                      <button className='cancel-button' onClick={() => handleCloseShowConfirmation()}>Cancel</button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default ResetPassword;