import '../css/register.css'
import evacudesk from '../assets/logo-two.png';
import backButton from '../assets/back-button.png';
import check from '../assets/check.png';
import error from '../assets/error.png';
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";


function Register() {
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [showResponse, setShowResponse] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseType, setResponseType] = useState("");
    const [exitAnim, setExitAnim] = useState(false);
    const [evacueeStep, setEvacueeStep] = useState(1);
    const [staffStep, setStaffStep] = useState(1);

    const [evacueeForm, setEvacueeForm] = useState({
        email_address: "",
        password: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        sex: "",
        birthdate: "",
        street_number: "",
        barangay: "",
        city: "",
        province: "",
        disabilities: "",
        id_picture: null
    });

    const [staffForm, setStaffForm] = useState({
        email_address: "",
        password: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        sex: "",
        birthdate: "",
        organization: "",
        position: "",
        authorization_letter: null,
        id_picture: null
    });

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
            setEvacueeStep(1);
            setStaffStep(1);
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

    const handleEvacueeBack = () => {
        if (evacueeStep > 1) {
            setLoading(true);
            clearAllTimeouts();

            loadingTimeout.current = setTimeout(() => {
                setEvacueeStep(prev => prev - 1);
                setLoading(false);
            }, 1000);
        } else {
            handleBackToChooseRegister();
        }
    };

    const handleStaffBack = () => {
        if (staffStep > 1) {
            setLoading(true);
            clearAllTimeouts();

            loadingTimeout.current = setTimeout(() => {
                setStaffStep(prev => prev - 1);
                setLoading(false);
            }, 1000);
        } else {
            handleBackToChooseRegister();
        }
    };

    const handleBackToChooseRegister = () => {
        setLoading(true);
        clearAllTimeouts();

        loadingTimeout.current = setTimeout(() => {
            setRole("");
            setLoading(false);
        }, 1000);
    };

    return(
        <>
            <div className='register'>
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

                <div className='register-body'>
                    <div className='register-left'>
                        {loading && (
                            <div className="loading-overlay" aria-hidden="true">
                                <div className="spinner" />
                            </div>
                        )}
                        {!loading && role === "evacuee" && (
                            <>
                                {evacueeStep === 1 && (
                                    <EvacueeRegisterOne
                                        onBack={handleEvacueeBack}
                                        onNext={() => setEvacueeStep(2)}
                                        formData={evacueeForm}
                                        setFormData={setEvacueeForm}
                                        setResponseMessage={setResponseMessage}
                                        setResponseType={setResponseType}
                                        setShowResponse={setShowResponse}
                                        setExitAnim={setExitAnim}
                                        showTimeout={showTimeout}
                                        exitTimeout={exitTimeout}
                                    />
                                )}
                                {evacueeStep === 2 && (
                                    <EvacueeRegisterTwo
                                        onBack={handleEvacueeBack}
                                        onNext={() => setEvacueeStep(3)}
                                        formData={evacueeForm}
                                        setFormData={setEvacueeForm}
                                        setResponseMessage={setResponseMessage}
                                        setResponseType={setResponseType}
                                        setShowResponse={setShowResponse}
                                        setExitAnim={setExitAnim}
                                        showTimeout={showTimeout}
                                        exitTimeout={exitTimeout}
                                    />
                                )}
                                {evacueeStep === 3 && (
                                    <EvacueeRegisterThree
                                        onBack={handleEvacueeBack}
                                        onNext={() => setEvacueeStep(4)}
                                        formData={evacueeForm}
                                        setFormData={setEvacueeForm}
                                        setResponseMessage={setResponseMessage}
                                        setResponseType={setResponseType}
                                        setShowResponse={setShowResponse}
                                        setExitAnim={setExitAnim}
                                        showTimeout={showTimeout}
                                        exitTimeout={exitTimeout}
                                    />
                                )}
                                {evacueeStep === 4 && (
                                    <EvacueeRegisterFour
                                        onBack={handleEvacueeBack}
                                        formData={evacueeForm}
                                        setFormData={setEvacueeForm}
                                        setResponseMessage={setResponseMessage}
                                        setResponseType={setResponseType}
                                        setShowResponse={setShowResponse}
                                        setExitAnim={setExitAnim}
                                        showTimeout={showTimeout}
                                        exitTimeout={exitTimeout}
                                    />
                                )}

                            </>
                        )}
                        {!loading && role === "staff" && (
                            <>
                                {staffStep === 1 && (
                                    <StaffRegisterOne
                                        formData={staffForm}
                                        setFormData={setStaffForm}
                                        onNext={() => setStaffStep(2)}
                                        onBack={handleStaffBack}
                                        setResponseMessage={setResponseMessage}
                                        setResponseType={setResponseType}
                                        setShowResponse={setShowResponse}
                                        setExitAnim={setExitAnim}
                                        showTimeout={showTimeout}
                                        exitTimeout={exitTimeout}
                                    />
                                )}
                                {staffStep === 2 && (
                                    <StaffRegisterTwo
                                        onBack={handleStaffBack}
                                        onNext={() => setStaffStep(3)}
                                        formData={staffForm}
                                        setFormData={setStaffForm}
                                        setResponseMessage={setResponseMessage}
                                        setResponseType={setResponseType}
                                        setShowResponse={setShowResponse}
                                        setExitAnim={setExitAnim}
                                        showTimeout={showTimeout}
                                        exitTimeout={exitTimeout}
                                    />
                                )}
                                {staffStep === 3 && (
                                    <StaffRegisterThree
                                        onBack={handleStaffBack}
                                        formData={staffForm}
                                        setFormData={setStaffForm}
                                        setResponseMessage={setResponseMessage}
                                        setResponseType={setResponseType}
                                        setShowResponse={setShowResponse}
                                        setExitAnim={setExitAnim}
                                        showTimeout={showTimeout}
                                        exitTimeout={exitTimeout}
                                    />
                                )}
                            </>
                        )}
                        {!loading && role === "" && <ChooseRegister onRoleSelect={handleRoleSelection} />}
                    </div>
                    <div className='register-right'></div>
                </div>
            </div>
        </>
    )
}

function ChooseRegister({ onRoleSelect }) {
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
            <br/>
            <br/>
            <br/>

            <div className="register-left-image">
                <img src={evacudesk} />
            </div>
            <div className="register-left-text">
                <h2>Register</h2>
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
                    Already have an account?{" "}
                    <span onClick={() => navigate("/login")} className="register-text">
                        Login
                    </span>
                </p>
            </div>
        </>
    );
}

function EvacueeRegisterOne({
    onBack,
    onNext,               
    formData,
    setFormData,
    setResponseMessage,
    setResponseType,
    setShowResponse,
    setExitAnim,
    showTimeout,
    exitTimeout
}) {
    const navigate = useNavigate();
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.password !== confirmPassword) {
            setResponseMessage("Passwords do not match.");
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

        onNext();
    };

    return(
        <>
            <div className="back-button-container">
                <button onClick={onBack}>
                    <img src={backButton} />
                </button>
            </div>
            <div className="wizard-navigation">
                <div className='wizard-active'></div>
                <div className='wizard'></div>
                <div className='wizard'></div>
                <div className='wizard'></div>
            </div>
            <div className="register-left-text">
                <br/>
                <h2>Evacuee Register</h2>
                <p>Please fill up the following details.</p>

                <form onSubmit={handleSubmit}>
                <label htmlFor='email_address'>Email</label>
                    <input
                        type="email"
                        id="email_address"
                        placeholder='john.doe@example.com'
                        value={formData.email_address}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor='password'>Password</label>
                    <input
                        type="password"
                        id="password"
                        placeholder='********'
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor='confirmPassword'>Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        placeholder='********'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <br/>
                    <button type="submit">Next</button>
                </form>

                <p>
                    Already have an account?{" "}
                    <span onClick={() => navigate("/login")} className="register-text">
                        Login
                    </span>
                </p>
            </div>
        </>
    )
}

function EvacueeRegisterTwo({
    onBack,
    onNext,               
    formData,
    setFormData,
    setResponseMessage,
    setResponseType,
    setShowResponse,
    setExitAnim,
    showTimeout,
    exitTimeout
}) {
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        onNext();
    };
    return(
        <>
            <div className="back-button-container">
                <button onClick={onBack}>
                    <img src={backButton} />
                </button>
            </div>
            <div className="wizard-navigation">
                <div className='wizard'></div>
                <div className='wizard-active'></div>
                <div className='wizard'></div>
                <div className='wizard'></div>
            </div>

            <div className="register-left-text">
                <h2>Evacuee Register</h2>


                <form onSubmit={handleSubmit}>
                <label htmlFor='first_name'>First Name</label>
                    <input
                        type="text"
                        id="first_name"
                        placeholder='John'
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor='last_name'>Last Name</label>
                    <input
                        type="text"
                        id="last_name"
                        placeholder='Doe'
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor='sex'>Sex</label>
                    <select
                        id="sex"
                        value={formData.sex}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Sex</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>

                    <label htmlFor="birthdate">Birthday</label>
                    <input
                        type="date"
                        id="birthdate"
                        value={formData.birthdate || ""}
                        onChange={handleChange}
                        required
                        max={new Date().toISOString().split("T")[0]}
                        className="birthday-input"
                    />

                    <label htmlFor="phone_number">Phone Number</label>
                    <input
                        type="tel"
                        id="phone_number"
                        placeholder='+63123456789'
                        value={formData.phone_number}
                        onChange={handleChange}
                        required
                    />

                    <br/>
                    <button type="submit">Next</button>
                </form>

            </div>
        </>
    )
}

function EvacueeRegisterThree({
    onBack,
    onNext,               
    formData,
    setFormData,
    setResponseMessage,
    setResponseType,
    setShowResponse,
    setExitAnim,
    showTimeout,
    exitTimeout
}) {
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        onNext();
    };

    return(
        <>
            <div className="back-button-container">
                <button onClick={onBack}>
                    <img src={backButton} />
                </button>
            </div>
            <div className="wizard-navigation">
                <div className='wizard'></div>
                <div className='wizard'></div>
                <div className='wizard-active'></div>
                <div className='wizard'></div>
            </div>

            <div className="register-left-text">
                <br/>
                <h2>Evacuee Register</h2>
                <br/>

                <form onSubmit={handleSubmit}>
                    <label htmlFor='street_number'>Street</label>
                    <input
                        type="text"
                        id="street_number"
                        placeholder='123 Cubao St.'
                        value={formData.street_number}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor='barangay'>Barangay</label>
                    <input
                        type="text"
                        id="barangay"
                        placeholder='Commonwealth'
                        value={formData.barangay}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor='city'>City</label>
                    <input
                        type="text"
                        id="city"
                        placeholder='Manila'
                        value={formData.city}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor='barangay'>Province</label>
                    <input
                        type="text"
                        id="province"
                        placeholder='Metro Manila'
                        value={formData.province}
                        onChange={handleChange}
                        required
                    />

                    <br/>
                    <button type="submit">Next</button>
                </form>

            </div>
        </>
    )
}

function EvacueeRegisterFour({
    onBack,             
    formData,
    setFormData,
    setResponseMessage,
    setResponseType,
    setShowResponse,
    setExitAnim,
    showTimeout,
    exitTimeout
}) {
    const [loading, setLoading] = useState(false); 
    const clearAllTimeouts = () => {
        if (showTimeout.current) {
            clearTimeout(showTimeout.current);
            showTimeout.current = null;
        }
        if (exitTimeout.current) {
            clearTimeout(exitTimeout.current);
            exitTimeout.current = null;
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    const handleEvacueeRegister = (e) => {
        e.preventDefault();
        setLoading(true);
        clearAllTimeouts();
        const formDataToSend = new FormData();
    
        for (const key in formData) {
            if (formData[key] !== undefined && formData[key] !== null) {
                formDataToSend.append(key, formData[key]);
            }
        }

        formDataToSend.append("country", "Philippines");
        formDataToSend.forEach((value, key) => {
            console.log(key, value);
          });
    
        fetch("http://localhost:3000/evacuee/signup", {
            method: "POST",
            body: formDataToSend, 
        })
            .then(async (response) => {
                const data = await response.json();
                console.log(data);
                if (!response.ok) {
                    throw new Error(data.error || "Registration failed");
                }
                return data;
            })
            .then((data) => {
                localStorage.setItem("evacueeId", data.id);

                setLoading(false);
                setResponseMessage("Registration successful!");
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
            <div className="back-button-container">
                <button onClick={onBack}>
                    <img src={backButton} />
                </button>
            </div>
            <div className="wizard-navigation">
                <div className='wizard'></div>
                <div className='wizard'></div>
                <div className='wizard'></div>
                <div className='wizard-active'></div>
            </div>
            <div className="register-left-text">
                <br/>
                <br/>
                <br/>
                <br/>
                <h2>Evacuee Register</h2>
                <br/>

                <form onSubmit={handleEvacueeRegister}>
                    <label htmlFor='disabilities'>Medical Needs</label>
                    <select
                        id="disabilities"
                        value={formData.disabilities}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Option</option>
                        <option value="Arthritis">Arthritis</option>
                        <option value="Injuries">Injuries</option>
                    </select>

                    <label htmlFor='id_picture'>ID Picture</label>
                    <input
                        type="file"
                        id="id_picture"
                        accept="image/*"
                        onChange={(e) => {
                            setFormData({
                                ...formData,
                                id_picture: e.target.files[0],
                            });
                        }}
                        required
                    />

                    <br/>
                    <button type="submit">Register</button>
                </form>

            </div>
        </>
    )
}


function StaffRegisterOne({
    onBack,
    onNext,               
    formData,
    setFormData,
    setResponseMessage,
    setResponseType,
    setShowResponse,
    setExitAnim,
    showTimeout,
    exitTimeout
}) {
    const navigate = useNavigate();
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.password !== confirmPassword) {
            setResponseMessage("Passwords do not match.");
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

        onNext();
    };

    return(
        <>
            <div className="back-button-container">
                <button onClick={onBack}>
                    <img src={backButton} />
                </button>
            </div>
            <div className="wizard-navigation">
                <div className='wizard-active'></div>
                <div className='wizard'></div>
                <div className='wizard'></div>
            </div>
            <div className="register-left-text">
                <br/>
                <h2>Staff Register</h2>
                <p>Please fill up the following details.</p>

                <form onSubmit={handleSubmit}>
                <label htmlFor='email_address'>Email</label>
                    <input
                        type="email"
                        id="email_address"
                        placeholder='john.doe@example.com'
                        value={formData.email_address}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor='password'>Password</label>
                    <input
                        type="password"
                        id="password"
                        placeholder='********'
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor='confirmPassword'>Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        placeholder='********'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <br/>
                    <button type="submit">Next</button>
                </form>

                <p>
                    Already have an account?{" "}
                    <span onClick={() => navigate("/login")} className="register-text">
                        Login
                    </span>
                </p>
            </div>
        </>
    )
}

function StaffRegisterTwo({
    onBack,
    onNext,               
    formData,
    setFormData,
    setResponseMessage,
    setResponseType,
    setShowResponse,
    setExitAnim,
    showTimeout,
    exitTimeout
}) {
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        onNext();
    };
    return(
        <>
            <div className="back-button-container">
                <button onClick={onBack}>
                    <img src={backButton} />
                </button>
            </div>
            <div className="wizard-navigation">
                <div className='wizard'></div>
                <div className='wizard-active'></div>
                <div className='wizard'></div>
            </div>

            <div className="register-left-text">
                <h2>Staff Register</h2>


                <form onSubmit={handleSubmit}>
                <label htmlFor='first_name'>First Name</label>
                    <input
                        type="text"
                        id="first_name"
                        placeholder='John'
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor='last_name'>Last Name</label>
                    <input
                        type="text"
                        id="last_name"
                        placeholder='Doe'
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor='sex'>Sex</label>
                    <select
                        id="sex"
                        value={formData.sex}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Sex</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>

                    <label htmlFor="birthdate">Birthday</label>
                    <input
                        type="date"
                        id="birthdate"
                        value={formData.birthdate || ""}
                        onChange={handleChange}
                        required
                        max={new Date().toISOString().split("T")[0]}
                        className="birthday-input"
                    />

                    <label htmlFor="phone_number">Phone Number</label>
                    <input
                        type="tel"
                        id="phone_number"
                        placeholder='+63123456789'
                        value={formData.phone_number}
                        onChange={handleChange}
                        required
                    />

                    <br/>
                    <button type="submit">Next</button>
                </form>

            </div>
        </>
    )
}

function StaffRegisterThree({
    onBack,
    onNext,               
    formData,
    setFormData,
    setResponseMessage,
    setResponseType,
    setShowResponse,
    setExitAnim,
    showTimeout,
    exitTimeout
}) {
    const [loading, setLoading] = useState(false); 
    const clearAllTimeouts = () => {
        if (showTimeout.current) {
            clearTimeout(showTimeout.current);
            showTimeout.current = null;
        }
        if (exitTimeout.current) {
            clearTimeout(exitTimeout.current);
            exitTimeout.current = null;
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    const handleStaffRegister = (e) => {
        e.preventDefault();
        setLoading(true);
        clearAllTimeouts();
        const formDataToSend = new FormData();
    
        for (const key in formData) {
            if (formData[key] !== undefined && formData[key] !== null) {
                formDataToSend.append(key, formData[key]);
            }
        }

        formDataToSend.append("country", "Philippines");
        console.log(formDataToSend);
    
        fetch("http://localhost:3000/staff/signup", {
            method: "POST",
            body: formDataToSend, 
        })
            .then(async (response) => {
                const data = await response.json();
                console.log(data);
                if (!response.ok) {
                    throw new Error(data.error || "Registration failed");
                }
                return data;
            })
            .then((data) => {
                localStorage.setItem("staffId", data.id);

                setLoading(false);
                setResponseMessage("Registration successful!");
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
            <div className="back-button-container">
                <button onClick={onBack}>
                    <img src={backButton} />
                </button>
            </div>
            <div className="wizard-navigation">
                <div className='wizard'></div>
                <div className='wizard'></div>
                <div className='wizard-active'></div>
            </div>

            <div className="register-left-text">
                <br/>
                <h2>Staff Register</h2>
                <br/>

                <form onSubmit={handleStaffRegister}>
                    <label htmlFor='organization'>Organization</label>
                    <input
                        type="text"
                        id="organization"
                        placeholder='PHINMA University of Pangasinan'
                        value={formData.organization}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor='position'>Position</label>
                    <input
                        type="text"
                        id="position"
                        placeholder='Manager'
                        value={formData.position}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor='id_picture'>ID Picture</label>
                    <input
                        type="file"
                        id="id_picture"
                        accept="image/*"
                        onChange={(e) => {
                            setFormData({
                                ...formData,
                                id_picture: e.target.files[0],
                            });
                        }}
                        required
                    />

                    <label htmlFor='authorization_letter'>Authorization Letter</label>
                    <input
                        type="file"
                        id="authorization_letter"
                        accept="image/*"
                        onChange={(e) => {
                            setFormData({
                                ...formData,
                                authorization_letter: e.target.files[0],
                            });
                        }}
                        required
                    />

                    <br/>
                    <button type="submit">Register</button>
                </form>

            </div>
        </>
    )
}

export default Register