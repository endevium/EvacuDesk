import '../../css/forgot-password.css'
import evacudesk from '../../assets/logo-two.png';
import backButton from '../../assets/back-button.png';
import check from '../../assets/check.png';
import error from '../../assets/error.png';
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Email from './Email';
import Verification from './Verification';
import ResetPassword from './ResetPassword';

function ForgotPassword() {
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
                body: JSON.stringify({ email, otp: inputOtp })
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
                body: JSON.stringify({ email, otp, password: newPassword })
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
                            <Email onSubmit={handleSendEmail} />
                        )}
                        {!loading && step === "verify" && (
                            <Verification onSubmit={handleVerifyOtp} />
                        )}
                        {!loading && step === "reset" && (
                            <ResetPassword onSubmit={handleResetPassword} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default ForgotPassword;