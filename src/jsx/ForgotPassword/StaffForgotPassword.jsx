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

function StaffForgotPassword() {
    const [step, setStep] = useState("email");
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
            const res = await fetch("http://localhost:3000/auth/request-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email_address: inputEmail,
                    role: "EvacuationCenter" 
                })
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
                setResponseMessage(data.error || "Failed to send OTP.");
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
                body: JSON.stringify({ 
                    email_address: email, 
                    code: inputOtp,
                    role: "EvacuationCenter"
                })
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
                setResponseMessage(data.error || "Invalid OTP.");
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
            const res = await fetch("http://localhost:3000/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email_address: email, 
                    role: "EvacuationCenter", 
                    newPassword: newPassword 
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
                setResponseMessage(data.error || "Failed to reset password.");
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
                            <Email onSubmit={handleSendEmail} setStep={setStep} />
                        )}
                        {!loading && step === "verify" && (
                            <Verification onSubmit={handleVerifyOtp} setStep={setStep} />
                        )}
                        {!loading && step === "reset" && (
                            <ResetPassword onSubmit={handleResetPassword} setStep={setStep} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default StaffForgotPassword;