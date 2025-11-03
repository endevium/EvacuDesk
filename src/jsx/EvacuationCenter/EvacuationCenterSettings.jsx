import { useState, useRef, useEffect } from 'react';

import '../../css/evacuee-settings.css';

import settingsActive from '../../assets/settings-active.png'
import check from '../../assets/check.png';
import error from '../../assets/error.png';
import userAvatar from '../../assets/profile-placeholder.png';
import Eye from '../../assets/Eye.png';
import Eyeoff from '../../assets/Eyeoff.png';


function EvacuationCenterSettings() {
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [streetNumber, setStreetNumber] = useState("");
    const [barangay, setBarangay] = useState("");
    const [city, setCity] = useState("Dagupan City");
    const [province, setProvince] = useState("Pangasinan");

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
    
    useEffect(() => {
        const fetchEvacuationCenterData = async () => {
            try {
                const evacuationCenterId = localStorage.getItem("evacuationCenterId");
                const token = localStorage.getItem("evacuationCenterToken");
                if (!evacuationCenterId) {
                    throw new Error("Evacuation center ID not found. Please log in again.");
                }

                const response = await fetch(`http://localhost:3000/evacuation-center/${evacuationCenterId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                setName(data.name);
                setEmail(data.email_address);
                setPhoneNumber(data.staff_contact_number);
                setStreetNumber(data.street);
                setBarangay(data.barangay);
            } catch (error) {
                console.error('Error fetching evacuation center details:', error);
            }
        };

        fetchEvacuationCenterData();
        const interval = setInterval(fetchEvacuationCenterData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        switch (id) {
            case "contactNo":
                setPhoneNumber(value);
                break;
            case "street":
                setStreetNumber(value);
                break;
            case "barangay":
                setBarangay(value);
                break;
            case "city":
                setCity(value);
                break;
            case "province":
                setProvince(value);
                break;
            default:
                break;
        }
    };

    const handleUpdateContactInformation = async () => {
        try {
            const evacuationCenterId = localStorage.getItem("evacuationCenterId");
            const token = localStorage.getItem("evacuationCenterToken");
    
            if (!evacuationCenterId || !token) {
                throw new Error("Session expired. Please log in again.");
            }
            
            const body = {
                staff_contact_number: phoneNumber,
                street: streetNumber,
                barangay: barangay,
                city: city,
                province: province
            };
            setLoading(true);

            await fetch(`http://localhost:3000/evacuation-center/${evacuationCenterId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Failed to update contact information");
                }
                return data;
            })
            .then((data) => {
                setLoading(false);
                setResponseMessage("Contact information updated successfully!");
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
                setResponseMessage(error.message || "An error occurred while updating contact information");
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
    
        } catch (error) {
            setLoading(false);
            setResponseMessage(error.message || "Unexpected error");
            setResponseType("error");
            setShowResponse(true);
        }
    };

    const handleUpdatePassword = async () => {
        if (!password.length >= 8) {
            setResponseMessage("Password must be at least 8 characters long");
            setResponseType("error");
            setShowResponse(true);

            clearTimeout(showTimeout.current);
            showTimeout.current = setTimeout(() => {
              setExitAnim(true);
              exitTimeout.current = setTimeout(() => {
                setShowResponse(false);
                setExitAnim(false);
              }, 400);
            }, 3000);

            return;
        }

        if (confirmPassword != newPassword) {
            setResponseMessage("Password does not match");
            setResponseType("error");
            setShowResponse(true);

            clearTimeout(showTimeout.current);
            showTimeout.current = setTimeout(() => {
              setExitAnim(true);
              exitTimeout.current = setTimeout(() => {
                setShowResponse(false);
                setExitAnim(false);
              }, 400);
            }, 3000);

            return;
        }

        try {
            const evacuationCenterId = localStorage.getItem("evacuationCenterId");
            const token = localStorage.getItem("evacuationCenterToken");
    
            if (!evacuationCenterId || !token) {
                throw new Error("Session expired. Please log in again.");
            }
            
            const body = {
                currentPassword: password,
                newPassword: newPassword
            };
            setLoading(true);

            await fetch(`http://localhost:3000/evacuation-center/password/${evacuationCenterId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            })
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to update password");
                }
                return data;
            })
            .then((data) => {
                setLoading(false);
                setResponseMessage("Password updated successfully!");
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
                setResponseMessage(error.message || "An error occurred while updating password");
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
    
        } catch (error) {
            setLoading(false);
            setResponseMessage(error.message || "Unexpected error");
            setResponseType("error");
            setShowResponse(true);
        }
    }

    return(
        <>  

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

            {loading && (
                <div className="loading-overlay" aria-hidden="true">
                    <div className="spinner" />
                </div>
            )}

            <div className="page-label">
                <div className="page-icon">
                    <img src={settingsActive} alt="icon" />
                </div>
                <div className="page-label-text">
                    <p>Settings</p>
                </div>
            </div>
            

            <div className="account-setting-main-content">
                <div className="setting-header">
                    <h2>Account Settings</h2>
                </div>

                <div className="setting-section">
                    <h3>Evacuation Center Information</h3>
                    <p className="section-subtitle">
                        Update your profile, contact details, and preferences to personalize your experience
                    </p>
                    

                    
                    <div className="form-row">
                        <div className="form-field full-name">
                            <label htmlFor="firstName">Evacuation Center Name</label>
                            <input
                                type="text"
                                id="firstName"
                                value={name}
                                onChange={handleChange}
                                disabled
                            />
                        </div>
                    </div>
                </div>

                <div className="divider"></div>

                <div className="setting-section">
                    <h3>Contact Information</h3>
                    <p className="section-subtitle">
                        Modify your contact information.
                    </p>

                    <div className="form-row address-row">
                        <div className="form-field city-field">
                        <label htmlFor="email_address">Email Address</label>
                        <input
                            type="text"
                            id="email_address"
                            value={email}
                            onChange={handleChange}
                            disabled
                        />
                        </div>

                        <div className="form-field province-field">
                        <label htmlFor="contactNo">Phone Number</label>
                        <input
                            type="text"
                            id="contactNo"
                            value={phoneNumber}
                            onChange={handleChange}
                            minLength={11}
                            maxLength={11}
                        />
                        </div>
                    </div>

                    <div className="form-row address-row">
                        <div className="form-field street-field">
                        <label htmlFor="street">Street No. / Street Name</label>
                        <input
                            type="text"
                            id="street"
                            value={streetNumber}
                            onChange={handleChange}
                        />
                        </div>

                        <div className="form-field barangay-field">
                            <label htmlFor="barangay">Barangay</label>
                            <select
                                id="barangay"
                                value={barangay || ""}
                                onChange={e => setBarangay(e.target.value)}
                                required
                            >
                                <option value="">Select Barangay</option>
                                {[
                                "Barangay I",
                                "Barangay II",
                                "Barangay IV",
                                "Bacayao Norte",
                                "Bacayao Sur",
                                "Barangay Pogo Chico",
                                "Barangay Pogo Grande",
                                "Bonuan Binloc",
                                "Bonuan Boquig",
                                "Bonuan Gueset",
                                "Calmay",
                                "Carael",
                                "Caranglaan",
                                "Herrero-Perez",
                                "Lasip Chico",
                                "Lasip Grande",
                                "Lomboy",
                                "Lucao",
                                "Malued",
                                "Mamalingling",
                                "Mangin",
                                "Mayombo",
                                "Pantal",
                                "Poblacion Oeste",
                                "Pogo Chico",
                                "Pogo Grande",
                                "Salapingao",
                                "Tambac",
                                "Tapuac",
                                "Tebeng",
                                ].map((brgy) => (
                                <option key={brgy} value={brgy}>
                                    {brgy}
                                </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row address-row">
                        <div className="form-field city-field">
                        <label htmlFor="city">City / Municipality</label>
                        <input
                            type="text"
                            id="city"
                            value={city}
                            onChange={handleChange}
                            disabled
                        />
                        </div>

                        <div className="form-field province-field">
                        <label htmlFor="province">Province</label>
                        <input
                            type="text"
                            id="province"
                            value={province}
                            onChange={handleChange}
                            disabled
                        />
                        </div>
                    </div>

                    <button
                        className="edit-save-btn"
                        onClick={() => handleUpdateContactInformation()}
                    >
                        Save
                    </button>
                </div>

                <div className="divider"></div>
                
                <div className="setting-section">
                    <h3>Password</h3>
                    
                    <p className="section-subtitle">
                        Modify your current password.
                    </p>
                    
                    
                    <div className="form-field">
                        <label>Old Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="********"
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
                        <div className="password-wrapper">
                            <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="********"
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

                        <label>Confirm Password</label>
                        <div className="password-wrapper">
                            <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="********"
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
                    </div>

                    <br />

                    <button
                        className="edit-save-btn"
                        onClick={() => handleUpdatePassword()}
                    >
                        Save
                    </button>
                </div>
            </div>
        </>
    )
}

export default EvacuationCenterSettings;