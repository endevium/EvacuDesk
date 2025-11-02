import '../../css/register.css'
import '../../css/Verification.css'
import evacudesk from '../../assets/logo-two.png';
import backButton from '../../assets/back-button.png';
import check from '../../assets/check.png';
import error from '../../assets/error.png';
import Eye from '../../assets/Eye.png';
import Eyeoff from '../../assets/Eyeoff.png';
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

function Register() {
    const navigate = useNavigate();
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [showResponse, setShowResponse] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseType, setResponseType] = useState("");
    const [exitAnim, setExitAnim] = useState(false);
    const [evacueeStep, setEvacueeStep] = useState(1);
    const [staffStep, setStaffStep] = useState(1);
    const loadingTimeout = useRef(null);
    const showTimeout = useRef(null);
    const exitTimeout = useRef(null);

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
        city: "Dagupan City",
        province: "Pangasinan",
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

    // Timeouts
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

    // Back Button functionality
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
                        {!loading && (
                            <>
                                {evacueeStep === 1 && (
                                    <EvacueeRegisterOne
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
                                        onNext={() => setEvacueeStep(5)}
                                        formData={evacueeForm}
                                        setFormData={setEvacueeForm}
                                        setResponseMessage={setResponseMessage}
                                        setResponseType={setResponseType}
                                        setShowResponse={setShowResponse}
                                        setExitAnim={setExitAnim}
                                        showTimeout={showTimeout}
                                        exitTimeout={exitTimeout}
                                        setLoading={setLoading}
                                    />
                                )}
                                {evacueeStep === 5 && (
                                    <EvacueeVerification
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
                    </div>
                    <div className='register-right'></div>
                </div>
            </div>
        </>
    )
}

function EvacueeRegisterOne({
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Input fields change
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    // Form submission functionality
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (/\s/.test(formData.password)) {
            setResponseMessage("Password must not contain spaces.");
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

        try {
            const res = await fetch(`http://localhost:3000/evacuee/existing-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email_address: formData.email_address
                })
            });
        
            const data = await res.json();
        
            if (res.status === 400) {
                setResponseMessage("This email is already registered.");
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
        
        } catch (error) {
            setResponseMessage(error.message || "An unexpected error occurred.");
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
        }        
    };

    return(
        <>
            <div className="back-button-container">
                <button onClick={() => navigate("/")}>
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
                <label htmlFor='email_address'>Email <span className="required">*</span></label>
                    <input
                        type="email"
                        id="email_address"
                        placeholder='john.doe@example.com'
                        value={formData.email_address}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor='password'>Password <span className="required">*</span></label>
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="********"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="password-input"
                            minLength={8}
                        />
                        <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <img src= {Eyeoff} /> : <img src= {Eye} />}
                        </button>
                    </div>

                    <label htmlFor='confirmPassword'>Confirm Password <span className="required">*</span></label>
                    <div className="password-wrapper">
                        <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="********"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="password-input"
                        minLength={8}
                        />
                        <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <img src= {Eyeoff} /> : <img src= {Eye} />}
                        </button>
                    </div>

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
    // Input fields on change
    const handleChange = (e) => {
        const { id, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    // Form submission functionality
    const handleSubmit = (e) => {
        e.preventDefault();

        // First name validation
        if (!/^[A-Za-zÀ-ÿ\s'-]+$/.test(formData.first_name)) {
            setResponseMessage("First name can only contain letters, spaces, hyphens, or apostrophes.");
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

        // Last name validation
        if (!/^[A-Za-zÀ-ÿ\s'-]+$/.test(formData.last_name)) {
            setResponseMessage("Last name can only contain letters, spaces, hyphens, or apostrophes.");
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

        // Phone number validation
        if (!/^09\d{9}$/.test(formData.phone_number)) {
            setResponseMessage("Phone number must start with 09 and be 11 digits long.");
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
                <div className='wizard'></div>
                <div className='wizard-active'></div>
                <div className='wizard'></div>
                <div className='wizard'></div>
            </div>

            <div className="register-left-text">
                <h2>Evacuee Register</h2>


                <form onSubmit={handleSubmit}>
                <label htmlFor='first_name'>First Name <span className="required">*</span></label>
                    <input
                        type="text"
                        id="first_name"
                        placeholder='John'
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor='last_name'>Last Name <span className="required">*</span></label>
                    <input
                        type="text"
                        id="last_name"
                        placeholder='Doe'
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor='sex'>Sex <span className="required">*</span></label>
                    <select
                        id="sex"
                        value={formData.sex}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>

                    <label htmlFor="birthdate">Birthday <span className="required">*</span></label>
                    <input
                        type="date"
                        id="birthdate"
                        value={formData.birthdate || ""}
                        onChange={handleChange}
                        required
                        max={new Date().toISOString().split("T")[0]}
                        className="birthday-input"
                    />

                    <label htmlFor="phone_number">Phone Number <span className="required">*</span></label>
                    <input
                        type="tel"
                        id="phone_number"
                        placeholder='09123456789'
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
    // Input fields onChange
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    // Form submission functionality
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
                    <label htmlFor='street_number'>Street Number <span className="required">*</span></label>
                    <input
                        type="text"
                        id="street_number"
                        placeholder='123 Cubao St.'
                        value={formData.street_number}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="barangay">Barangay <span className="required">*</span></label>
                    <select
                        id="barangay"
                        value={formData.barangay}
                        onChange={handleChange}
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

                    <label htmlFor="city">City / Municipality <span className="required">*</span></label>
                    <input
                        type="text"
                        id="city"
                        value="Dagupan City"
                        readOnly
                        className="readonly-field"
                    />

                    <label htmlFor="province">Province <span className="required">*</span></label>
                    <input
                        type="text"
                        id="province"
                        value="Pangasinan"
                        readOnly
                        className="readonly-field"
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
    onNext,
    formData,
    setFormData,
    setResponseMessage,
    setResponseType,
    setShowResponse,
    setExitAnim,
    showTimeout,
    exitTimeout,
    setLoading
}) {
    // Timeouts
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

    // Input fields onChange
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    // Submission functionality w/ API integration
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

        // Automatically append the country
        formDataToSend.append("country", "Philippines");
        formDataToSend.forEach((value, key) => {
            console.log(key, value);
        });
    
        fetch("http://localhost:3000/evacuee/signup", {
            method: "POST",
            body: formDataToSend, 
        })  
            // Get response
            .then(async (response) => {
                const data = await response.json();
                console.log(data);
                if (!response.ok) {
                    throw new Error(data.error || "Registration failed");
                }
                return data;
            })
            // Get data from successful response
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
                        onNext();
                    }, 400);
                }, 1000);
            })
            // Show error message
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
                    <label htmlFor='disabilities'>Special Notes or Medical Conditions</label>
                    <input
                        type="text"
                        id="disabilities"
                        value={formData.disabilities}
                        placeholder="Please indicate N/A if none"
                        onChange={handleChange}
                    />

                    <label htmlFor='id_picture'>ID Picture <span className="required">*</span></label>
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

function EvacueeVerification({
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
    const navigate = useNavigate();
    const [code, setCode] = useState(new Array(6).fill(""));
    const [loading, setLoading] = useState(false);

    // Input fields onChange
    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;
        let newCode = [...code];
        newCode[index] = element.value;
        setCode(newCode);

        if (element.nextSibling && element.value !== "") {
            element.nextSibling.focus();
        }
    };

    // OTP submission functionality
    const handleSubmit = async (e) => {
        e.preventDefault();
        const otp = code.join("");
        if (otp.length !== 6) return;

        setLoading(true);
        setShowResponse(false);

        try {
            const res = await fetch("http://localhost:3000/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email_address: formData.email_address,
                    code: otp,
                    role: "Evacuee",
                    purpose: "verify"
                })
            });
            const data = await res.json();
            setLoading(false);

            if (res.ok) {
                setResponseType("success");
                setResponseMessage(data.message || "Account verified!");
                setShowResponse(true);

                showTimeout.current = setTimeout(() => {
                    setExitAnim(true);
                    exitTimeout.current = setTimeout(() => {
                        setShowResponse(false);
                        setExitAnim(false);
                        navigate("/login");
                    }, 400);
                }, 1000);
            } else {
                setResponseType("error");
                setResponseMessage(data.error || "Invalid OTP.");
                setShowResponse(true);

                showTimeout.current = setTimeout(() => {
                    setExitAnim(true);
                    exitTimeout.current = setTimeout(() => {
                        setShowResponse(false);
                        setExitAnim(false);
                    }, 400);
                }, 3000);
            }
        } catch (err) {
            setLoading(false);
            setResponseType("error");
            setResponseMessage("Network error.");
            setShowResponse(true);

            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 3000);
        }
    };

    return (
        <>
            <div className="back-button-container">
                <button onClick={onBack}>
                    <img src={backButton} />
                </button>
            </div>
            
            <div className="register-left-text">
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
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
                                disabled={loading}
                            />
                        ))}
                    </div>
                    <br/>
                    <br/>
                    <br/>
                    <button type="submit" className="continue-button" disabled={loading}>
                        {loading ? "Verifying..." : "Continue"}
                    </button>
                </form>
            </div>
        </>
    );
}

{/*function StaffRegisterOne({
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
    const navigate = useNavigate();

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

                setLoading(true);
                setResponseMessage("Your account is now under review. Please wait until your account has been reviewed.");
                setResponseType("success");
                setShowResponse(true);
    
                showTimeout.current = setTimeout(() => {
                    setExitAnim(true);
                    exitTimeout.current = setTimeout(() => {
                        setShowResponse(false);
                        setExitAnim(false);
                        navigate("/login");
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
}*/}

export default Register