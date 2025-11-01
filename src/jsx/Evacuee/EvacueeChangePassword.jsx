import '../../css/forgot-password.css'
import evacudesk from '../../assets/logo-two.png';
import backButton from '../../assets/back-button.png';
import check from '../../assets/check.png';
import error from '../../assets/error.png';
import Eye from '../../assets/Eye.png';
import Eyeoff from '../../assets/Eyeoff.png';
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

function EvacueeChangePassword() {
    const [step, setStep] = useState("email"); // "email" | "verify" | "reset"
    const [loading, setLoading] = useState(false);
    const [showResponse, setShowResponse] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseType, setResponseType] = useState("");
    const [exitAnim, setExitAnim] = useState(false);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const navigate = useNavigate();

    const loadingTimeout = useRef(null);
    const showTimeout = useRef(null);
    const exitTimeout = useRef(null);

    const clearAllTimeouts = () => {
        if (loadingTimeout.current) { clearTimeout(loadingTimeout.current); loadingTimeout.current = null; }
        if (showTimeout.current) { clearTimeout(showTimeout.current); showTimeout.current = null; }
        if (exitTimeout.current) { clearTimeout(exitTimeout.current); exitTimeout.current = null; }
    };

    useEffect(() => {
        return () => {
            clearAllTimeouts();
        };
    }, []);

    // Step 1: Send email
    const handleSendEmail = async (inputEmail) => {
        setLoading(true);
        clearAllTimeouts();
        setEmail(inputEmail);

        try {
            const res = await fetch("http://localhost:3000/evacuee/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email_address: inputEmail })
            });
            const data = await res.json();
            setLoading(false);

            if (res.ok) {
                setResponseType("success");
                setResponseMessage(data.message || "OTP sent to your email.");
                setShowResponse(true);
                setStep("verify");
            } else {
                setResponseType("error");
                setResponseMessage(data.message || "Failed to send OTP.");
                setShowResponse(true);
            }
        } catch (err) {
            setLoading(false);
            setResponseType("error");
            setResponseMessage("Network error.");
            setShowResponse(true);
        }
        showTimeout.current = setTimeout(() => {
            setExitAnim(true);
            exitTimeout.current = setTimeout(() => {
                setShowResponse(false);
                setExitAnim(false);
            }, 400);
        }, 3000);
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (inputOtp) => {
        setLoading(true);
        clearAllTimeouts();
        setOtp(inputOtp);

        try {
            const res = await fetch("http://localhost:3000/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email_address, otp: inputOtp })
            });
            const data = await res.json();
            setLoading(false);

            if (res.ok) {
                setResponseType("success");
                setResponseMessage(data.message || "OTP verified.");
                setShowResponse(true);
                setStep("reset");
            } else {
                setResponseType("error");
                setResponseMessage(data.message || "Invalid OTP.");
                setShowResponse(true);
            }
        } catch (err) {
            setLoading(false);
            setResponseType("error");
            setResponseMessage("Network error.");
            setShowResponse(true);
        }
        showTimeout.current = setTimeout(() => {
            setExitAnim(true);
            exitTimeout.current = setTimeout(() => {
                setShowResponse(false);
                setExitAnim(false);
            }, 400);
        }, 3000);
    };

    // Step 3: Reset password
    const handleResetPassword = async (newPassword) => {
        setLoading(true);
        clearAllTimeouts();

        try {
            const res = await fetch("http://localhost:3000/evacuee/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email_address, 
                    code: otp, 
                    role: "Evacuee",
                    purpose: "reset",
                    newPassword: newPassword,
                })
            });
            const data = await res.json();
            setLoading(false);

            if (res.ok) {
                setResponseType("success");
                setResponseMessage(data.message || "Password reset successful.");
                setShowResponse(true);
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setResponseType("error");
                setResponseMessage(data.message || "Failed to reset password.");
                setShowResponse(true);
            }
        } catch (err) {
            setLoading(false);
            setResponseType("error");
            setResponseMessage("Network error.");
            setShowResponse(true);
        }
        showTimeout.current = setTimeout(() => {
            setExitAnim(true);
            exitTimeout.current = setTimeout(() => {
                setShowResponse(false);
                setExitAnim(false);
            }, 400);
        }, 3000);
    };

    return (
        <>
            <div className="login">
                {showResponse && (
                    <div
                        className={`response-body ${responseType} ${exitAnim ? "exit" : ""}`}
                        role="status"
                        aria-live="polite"
                    >
                        {responseType === "success" ? (
                            <img src={check} alt="success" />
                        ) : (
                            <img src={error} alt="error" />
                        )}
                        <p>{responseMessage}</p>
                    </div>
                )}

                <div className="login-body">
                    <div className="login-left"></div>
                    <div className="login-right">
                        {loading && (
                            <div className="loading-overlay" aria-hidden="true">
                                <div className="spinner" />
                            </div>
                        )}
                        {!loading && step === "email" && (
                            <ChangePasswordOne onSubmit={handleSendEmail} />
                        )}
                        {!loading && step === "verify" && (
                            <ChangePasswordTwo onSubmit={handleVerifyOtp} />
                        )}
                        {!loading && step === "reset" && (
                            <ChangePasswordThree onSubmit={handleResetPassword} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function ChangePasswordOne({ onSubmit }) {
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
            <button>
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
            <h2>Change Password</h2>
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

function ChangePasswordTwo({ onSubmit }) {
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

const ChangePasswordThree = ({ onSubmit }) => {
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        <br />
        <br />
        <br />

        <div className="login-right-text">
            <h2>Change Password</h2>
            <p>Please enter your old and new password.</p>

            <form onSubmit={handleSubmit}>

            <label>Old Password</label>
            <div className="password-wrapper-two">
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

            <label>New Password</label>
            <div className="password-wrapper-two">
                <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="password-input"
                />
                <button
                type="button"
                className="eye-btn"
                onClick={() => setShowNewPassword(!showNewPassword)}
                >
                    {showNewPassword ? <img src= {Eyeoff} /> : <img src= {Eye} />}
                </button>
            </div>

            <label>Confirm New Password</label>
            <div className="password-wrapper-two">
                <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="password-input"
                />
                <button
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                    {showConfirmPassword ? <img src= {Eyeoff} /> : <img src= {Eye} />}
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

export default EvacueeChangePassword;