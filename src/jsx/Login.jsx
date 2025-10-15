import '../css/login.css';
import evacudesk from '../assets/logo-two.png';
import backButton from '../assets/back-button.png';
import check from '../assets/check.png';
import error from '../assets/error.png';
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

function Login() {
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [showResponse, setShowResponse] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseType, setResponseType] = useState("");
    const [exitAnim, setExitAnim] = useState(false);
    const navigate = useNavigate()

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

    const handleRoleSelection = (selectedRole) => {
        setLoading(true);
        clearAllTimeouts();

        loadingTimeout.current = setTimeout(() => {
            setRole(selectedRole);
            setLoading(false);

            setShowResponse(false);
            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 3000);
        }, 1000);
    };

    const handleEvacueeLogin = (email_address, password) => {
        setLoading(true);
        clearAllTimeouts();
    
        const payload = {
            email_address,
            password,
        };
    
        fetch("http://localhost:3000/evacuee/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload), 
        })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) {

                    throw new Error(data.error || "Invalid credentials");
                }
                return data;
            })
            .then((data) => {
                localStorage.setItem("evacueeId", data.id);
                localStorage.setItem("evacueeToken", data.token);

                const token = localStorage.getItem("evacueeToken");
                console.log(token);

                setLoading(false);
                setResponseMessage("Login successful!");
                setResponseType("success");
                setShowResponse(true);

                showTimeout.current = setTimeout(() => {
                    setExitAnim(true);
                    exitTimeout.current = setTimeout(() => {
                        setShowResponse(false);
                        setExitAnim(false);
                    }, 400);
                }, 5000);

                setTimeout(() => {
                    navigate("/evacuee");
                }, 2000);

            })
            .catch((error) => {
                setLoading(false); 
                setResponseMessage(error.message || "An error occurred");
                setResponseType("error");
                setShowResponse(true);

                showTimeout.current = setTimeout(() => {
                    setExitAnim(true);
                    exitTimeout.current = setTimeout(() => {
                        setShowResponse(false);
                        setExitAnim(false);
                    }, 400);
                }, 3000);
            });
    };

    const handleStaffLogin = (email_address, password) => {
        setLoading(true);
        clearAllTimeouts();
    
        const payload = {
            email_address,
            password,
        };
    
        fetch("http://localhost:3000/staff/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload), 
        })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) {

                    throw new Error(data.error || "Invalid credentials");
                }
                return data;
            })
            .then((data) => {
                setLoading(false);
                setResponseMessage("Login successful!");
                setResponseType("success");
                setShowResponse(true);

                showTimeout.current = setTimeout(() => {
                    setExitAnim(true);
                    exitTimeout.current = setTimeout(() => {
                        setShowResponse(false);
                        setExitAnim(false);
                    }, 400);
                }, 3000);
            })
            .catch((error) => {
                localStorage.setItem("staffId", data.id);
                localStorage.setItem("staffToken", data.token);

                setLoading(false); 
                setResponseMessage(error.message || "An error occurred");
                setResponseType("error");
                setShowResponse(true);

                showTimeout.current = setTimeout(() => {
                    setExitAnim(true);
                    exitTimeout.current = setTimeout(() => {
                        setShowResponse(false);
                        setExitAnim(false);
                    }, 400);
                }, 3000);
            });
    };

    const handleBackToChooseLogin = () => {
        setLoading(true);
        clearAllTimeouts();

        loadingTimeout.current = setTimeout(() => {
            setRole("");
            setLoading(false);
        }, 1000);
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
                        {!loading && role === "evacuee" && <EvacueeLogin
                                                            onBack={handleBackToChooseLogin}
                                                            onLogin={handleEvacueeLogin}
                                                            setResponseMessage={setResponseMessage}
                                                            setResponseType={setResponseType}
                                                            setShowResponse={setShowResponse}
                                                            setExitAnim={setExitAnim}
                                                            showTimeout={showTimeout}
                                                            exitTimeout={exitTimeout}
                                                            />}
                        {!loading && role === "staff" && <StaffLogin
                                                            onBack={handleBackToChooseLogin}
                                                            onLogin={handleStaffLogin}
                                                            setResponseMessage={setResponseMessage}
                                                            setResponseType={setResponseType}
                                                            setShowResponse={setShowResponse}
                                                            setExitAnim={setExitAnim}
                                                            showTimeout={showTimeout}
                                                            exitTimeout={exitTimeout}
                                                            />}
                        {!loading && role === "" && <ChooseLogin onRoleSelect={handleRoleSelection} />}
                    </div>
                </div>
            </div>
        </>
    );
}

function ChooseLogin({ onRoleSelect }) {
    const navigate = useNavigate();

    const handleContinue = () => {
        const selectedRole = document.getElementById("role-select").value;
        if (selectedRole) {
            onRoleSelect(selectedRole);
        }
    };

    return (
        <>
            <div className="back-button-container">
                <button onClick={() => navigate("/")}>
                    <img src={backButton} />
                </button>
            </div>
            <div className="login-right-image">
                <img src={evacudesk} />
            </div>
            <div className="login-right-text">
                <h2>Login</h2>
                <p>Please select your role.</p>
                <select className="role-select" id="role-select">
                    <option value="">Select Role</option>
                    <option value="evacuee">Evacuee</option>
                    <option value="staff">Staff</option>
                </select>

                <button className="proceed-button" onClick={handleContinue}>
                    Continue
                </button>
                <p>
                    Don't have an account yet?{" "}
                    <span onClick={() => navigate("/register")} className="register-text">
                        Register
                    </span>
                </p>
            </div>
        </>
    );
}

function EvacueeLogin({
    onBack,
    onLogin,
    setResponseMessage,
    setResponseType,
    setShowResponse,
    setExitAnim,
    showTimeout,
    exitTimeout,
  }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false); 

    useEffect(() => {
        const savedEmail = localStorage.getItem("evacuee_email");
        const savedPassword = localStorage.getItem("evacuee_password");
        if (savedEmail && savedPassword) {
            setEmail(savedEmail);
            setPassword(savedPassword);
            setRememberMe(true);
        }
    }, []);

    const validateInputs = () => {
        if (!email) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(email)) return "Invalid email format";
        if (!password) return "Password is required";
        return null;
    };

    const handleLoginClick = () => {
        const errorMessage = validateInputs();
    
        if (errorMessage) {
            setResponseMessage(errorMessage);
            setResponseType("error");
            setShowResponse(true);
    
            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 3000);
        } else {
            if (rememberMe) {
              localStorage.setItem("evacuee_email", email);
              localStorage.setItem("evacuee_password", password);
            } else {
              localStorage.removeItem("evacuee_email");
              localStorage.removeItem("evacuee_password");
            }
        
            onLogin(email, password);
        }
    };

    return (
        <>
            <div className="back-button-container">
                <button onClick={onBack}>
                    <img src={backButton} />
                </button>
            </div>
            <div className="login-right-image">
                <img src={evacudesk} />
            </div>
            <div className="login-right-text">
                <h2>Evacuee Login</h2>
                <p>Welcome back! Please proceed with your login.</p>

                <label>Email</label>
                <input
                    type="email"
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label>Password</label>
                <input
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <div className="additionals">
                    <input
                        type="checkbox"
                        className="remember-me"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="rememberMe">Remember Me</label>
                    <span>Forgot Password?</span>
                </div>
                <button onClick={handleLoginClick}>Login</button>
                <p>
                    Don't have an account yet?{" "}
                    <span onClick={() => navigate("/register")} className="register-text">
                        Register
                    </span>
                </p>
            </div>
        </>
    );
}

function StaffLogin({
    onBack,
    onLogin,
    setResponseMessage,
    setResponseType,
    setShowResponse,
    setExitAnim,
    showTimeout,
    exitTimeout,
  }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false); 

    useEffect(() => {
        const savedEmail = localStorage.getItem("staff_email");
        const savedPassword = localStorage.getItem("staff_password");
        if (savedEmail && savedPassword) {
            setEmail(savedEmail);
            setPassword(savedPassword);
            setRememberMe(true);
        }
    }, []);

    const validateInputs = () => {
        if (!email) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(email)) return "Invalid email format";
        if (!password) return "Password is required";
        return null;
    };

    const handleLoginClick = () => {
        const errorMessage = validateInputs();
    
        if (errorMessage) {
            setResponseMessage(errorMessage);
            setResponseType("error");
            setShowResponse(true);
    
            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 3000);
        } else {
            if (rememberMe) {
              localStorage.setItem("staff_email", email);
              localStorage.setItem("staff_password", password);
            } else {
              localStorage.removeItem("staff_email");
              localStorage.removeItem("staff_password");
            }
        
            onLogin(email, password);
        }
    };

    return (
        <>
            <div className="back-button-container">
                <button onClick={onBack}>
                    <img src={backButton} />
                </button>
            </div>
            <div className="login-right-image">
                <img src={evacudesk} />
            </div>
            <div className="login-right-text">
                <h2>Staff Login</h2>
                <p>Welcome back! Let’s keep communities safe together.</p>

                <label>Email</label>
                <input
                    type="email"
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label>Password</label>
                <input
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <div className="additionals">
                    <input
                        type="checkbox"
                        className="remember-me"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="rememberMe">Remember Me</label>
                    <span>Forgot Password?</span>
                </div>
                <button onClick={handleLoginClick}>Login</button>
                <p>
                    Don't have an account yet?{" "}
                    <span onClick={() => navigate("/register")} className="register-text">
                        Register
                    </span>
                </p>
            </div>
        </>
    );
}

export default Login;