import { useState } from "react";
import backButton from '../../assets/back-button.png';

function Verification({ onSubmit }) {
  const [code, setCode] = useState(new Array(6).fill(""));

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    let newCode = [...code];
    newCode[index] = element.value;
    setCode(newCode);

    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otp = code.join("");
    if (otp.length === 6) {
      onSubmit(otp);
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
        <h2>Verification Code</h2>
        <p>Please enter the verification code sent to your email.</p>
        <form onSubmit={handleSubmit} className="code-inputs">
          <div className="otp-inputs">
            {code.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onFocus={(e) => e.target.select()}
                className="otp-input"
              />
            ))}
          </div>
          <button type="submit" className="continue-button">
            Continue
          </button>
        </form>
      </div>
    </>
  );
}

export default Verification;