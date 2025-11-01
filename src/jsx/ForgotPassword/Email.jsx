import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import backButton from '../../assets/back-button.png';
import evacudesk from '../../assets/logo-two.png';

function Email({ onSubmit, setStep }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      onSubmit(email);
    }
  };

  return (
    <>
      <div className="back-button-container">
          <button onClick={() => navigate("/login")}>
              <img src={backButton} />
          </button>
      </div>

      <br />
      <br />
      <br />
      <br />
      
      <div className="login-right-image">
          <img src={evacudesk} />
      </div>

      
      <div className="login-right-text">
        <h2>Forgot Password</h2>
        <p>Please enter your email.</p>
        <form onSubmit={handleSubmit}>

          <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
          />

          <br />
          <button type="submit" className="proceed-button">
            Continue
          </button>
        </form>
      </div>
    </>
  );
}

export default Email;