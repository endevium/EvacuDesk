import '../css/admin-login.css';
import evacudesk from '../assets/logo-two.png';
import backButton from '../assets/back-button.png';
import check from '../assets/check.png';
import error from '../assets/error.png';
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

function AdminLogin() {
    const [loading, setLoading] = useState(false);
    const [showResponse, setShowResponse] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseType, setResponseType] = useState("");
    const [exitAnim, setExitAnim] = useState(false);

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

    const handleAdminLogin = (username, password) => {
        setLoading(true);
        clearAllTimeouts();
    
        const payload = {
            username,
            password,
        };
    
        fetch("http://localhost:3000/admin/login", {
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

    return(
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
                        {!loading && <AdminBody
                                        onLogin={handleAdminLogin}
                                        setResponseMessage={setResponseMessage}
                                        setResponseType={setResponseType}
                                        setShowResponse={setShowResponse}
                                        setExitAnim={setExitAnim}
                                        showTimeout={showTimeout}
                                        exitTimeout={exitTimeout}
                                        />}
                    </div>
                </div>
            </div>
        </>
    )
}

function AdminBody({
    onLogin,
    setResponseMessage,
    setResponseType,
    setShowResponse,
    setExitAnim,
    showTimeout,
    exitTimeout,
}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const validateInputs = () => {
        if (!username) return "Username is required";
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
            onLogin(username, password);
        }
    };

    return(
        <>  
            <br/>
            <br/>
            <br/>
            <br/>

            <div className="login-right-image">
                <img src={evacudesk} />
            </div>
            <div className="login-right-text">
                <h2>Admin Login</h2>
                <p>Welcome back! Please proceed with your login.</p>

                <label>Username</label>
                <input
                    type="text"
                    placeholder="JohnDoe0609"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label>Password</label>
                <input
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button onClick={handleLoginClick}>Login</button>
            </div>
        </>
    )

}

export default AdminLogin
