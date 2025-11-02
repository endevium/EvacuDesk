import '../../css/admin.css';
import { useEffect, useState, useRef} from 'react';

import evacuationCenterActive from '../../assets/evacuation-center-active.png';
import evacCenter from '../../assets/evac-center-placeholder.png';
import close from '../../assets/close.png';
import check from '../../assets/check.png';
import error from '../../assets/error.png';
import requestBtn from '../../assets/request-button.png';
import Eye from '../../assets/Eye.png';
import Eyeoff from '../../assets/Eyeoff.png';

function CreateEvacuationCenter() {
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [showEvacCenter, setShowEvacCenter] = useState(false);
    const [showCreateEvac, setShowCreateEvac] = useState(false);
    const [showResponse, setShowResponse] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseType, setResponseType] = useState("");
    const [exitAnim, setExitAnim] = useState(false);
    const showTimeout = useRef(null);
    const exitTimeout = useRef(null);
    const token = localStorage.getItem("adminToken");

    // EVAC CENTER MODEL
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [capacity, setCapacity] = useState(1);
    const [email_address, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [phone_number, setPhoneNumber] = useState("");
    const [street, setStreetNumber] = useState("");
    const [barangay, setBarangay] = useState("");
    const [city, setCity] = useState("Dagupan City");
    const [province, setProvince] = useState("Pangasinan");
    const [region, setRegion] = useState("1");
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(evacCenter);

    const handleImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;                
        setImage(file);                  
        const objectUrl = URL.createObjectURL(file);
        setPreviewImage(objectUrl); 
    };

    const handleClear = () => {
        setName("");
        setType("");
        setCapacity(1);
        setEmailAddress("");
        setPassword("");
        setPhoneNumber("");
        setStreetNumber("");
        setBarangay("");
        setCity("Dagupan City");
        setProvince("Pangasinan");
        setRegion("1");
        setImage(null);
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
            setPreviewImage(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    const createEC = async (e) => {
        e.preventDefault();

        clearAllTimeouts();
        setLoading(true);

        if (!/^09\d{9}$/.test(phone_number)) {
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

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("type", type);
            formData.append("capacity", capacity);
            formData.append("email_address", email_address);
            formData.append("password", password);
            formData.append("staff_contact_number", phone_number);
            formData.append("street", street);
            formData.append("barangay", barangay);
            formData.append("city", city);
            formData.append("province", province);
            formData.append("region", region);
            formData.append("image", image);

            const res = await fetch("http://localhost:3000/evacuation-center/", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            })
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Creating evacuation center failed");
            }

            setResponseMessage("Evacuation center created successfully!");
            setResponseType("success");
            setShowResponse(true);

            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 4000);

            handleCloseCreateEvacCenter();
        } catch (e) {
            console.error("Announcement error:", e);
            setResponseMessage(e.message);
            setResponseType("error");
            setShowResponse(true);

            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 4000);
        } finally {
            setLoading(false);
        }
    }

    // RESPONSEBODY TIMEOUTS
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

    // FETCH ALL CENTERS
    useEffect(() => {
        const fetchCenters = async () => {
            try {
                const response = await fetch('http://localhost:3000/evacuation-center/');
                const data = await response.json();
                setCenters(data);
            } catch (error) {
                console.error('Error fetching evacuation centers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCenters();
        const interval = setInterval(fetchCenters, 5000);
        return () => clearInterval(interval);
    }, []);


    // SHOW CREATE EVAC CENTER
    const handleShowCreateEvacCenter = () => setShowCreateEvac(true);
    const handleCloseCreateEvacCenter = () => setShowCreateEvac(false);

    // SHOW SELECTED CENTER
    const handleShowSelectedCenter = (center) => {
        setSelectedCenter(center);
        setShowEvacCenter(true);
    }
    const handleCloseSelectedCenter = () => setShowEvacCenter(false);

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

            <div className='page-label'>
                <div className='page-icon'>
                    <img src={evacuationCenterActive} alt='icon' />
                </div>
                <div className='page-label-text'>
                    <p>Evacuation Centers</p>
                </div>
                <button className="create-ec-button" onClick={handleShowCreateEvacCenter} >
                    <img src={requestBtn} alt="create" />
                    Create Center
                </button>
            </div>

            <div className='page-content-create-center'>
                <div>
                    <div className='evacuation-centers-root'>
                        {loading ? (
                            <p>Loading evacuation centers...</p>
                        ) : centers.length === 0 ? (
                            <p>No evacuation centers found.</p>
                        ) : (
                            centers.map(center => (
                                <div key={center._id} className='evacuation-center-card'>
                                    <div className='evacuation-center-image'>
                                        <img
                                            src={`http://localhost:3000/${center.image}`}
                                            alt={center.name}
                                            onError={(e) => {
                                                e.target.src = evacCenter;
                                            }}
                                        />
                                    </div>
                                    <div className='evacuation-center-details'>
                                        <h2>{center.name}</h2>
                                        <p>
                                            {center.street}, {center.barangay}, {center.city}, {center.province}
                                        </p>
                                        <p><span>{center.taken_slots}/{center.capacity}</span></p>
                                    </div>
                                    <br/>
                                    <div className='evacuation-button'>
                                        <button onClick={() => handleShowSelectedCenter(center)}>
                                            View
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {showCreateEvac && (
                <div className='create-evac-center'>
                    <div className='create-evac-center-body'>
                        <div className="close-container" onClick={handleCloseCreateEvacCenter}>
                            <button>
                                <img src={close} alt="close" />
                            </button>
                        </div>

                        <div className='details'>
                            <h2>Create Evacuation Center</h2>
                            <div className='input-fields'>
                                <form onSubmit={createEC}>
                                    <div className='form-fields'>
                                        <div className='important-details'>
                                            <div className='announcement-image'>
                                                <img src={previewImage}/>
                                            </div>

                                            <label>Image <span className="required">*</span></label>
                                            <input 
                                            type='file' 
                                            accept='image/*'
                                            required 
                                            onChange={handleImageChange}
                                            />

                                            <label>Evacuation Center Name <span className="required">*</span></label>
                                            <input 
                                            type='text' 
                                            placeholder='PHINMA UPang' 
                                            required 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            />

                                            <label>Type <span className="required">*</span></label>
                                            <select
                                                required 
                                                value={type}
                                                onChange={(e) => setType(e.target.value)}
                                            >
                                                <option defaultChecked>Select Type</option>
                                                <option value="School">School</option>
                                                <option value="Covered Court">Covered Court</option>
                                                <option value="Auditorium">Auditorium</option>
                                                <option value="Barangay Hall">Barangay Hall</option>
                                                <option value="Open Field">Open Field</option>
                                            </select>

                                            <label>Capacity <span className="required">*</span></label>
                                            <input 
                                            type='number' 
                                            placeholder='0' 
                                            min="1"
                                            required 
                                            value={capacity}
                                            onChange={(e) => setCapacity(e.target.value)}
                                            />
                                        </div>

                                        <div className='location-details'>
                                            <h2>Account Details</h2>
                                            <label>Email Address <span className="required">*</span></label>
                                            <input 
                                            type='email' 
                                            placeholder='john.doe@example.com' 
                                            required 
                                            value={email_address}
                                            onChange={(e) => setEmailAddress(e.target.value)}
                                            />

                                            <label>Password <span className="required">*</span></label>
                                            <div className="password-wrapper">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="********"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    minLength={8}
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

                                            <label>Phone Number <span className="required">*</span></label>
                                            <input 
                                            type='tel' 
                                            placeholder='09123456789' 
                                            minLength={11}
                                            maxLength={11}
                                            required 
                                            value={phone_number}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            />
                                        </div>

                                        <div className='location-details'>
                                            <h2>Location</h2>
                                            <label>Street Number <span className="required">*</span></label>
                                            <input 
                                            type='text' 
                                            placeholder='123 Apple St.' 
                                            required 
                                            value={street}
                                            onChange={(e) => setStreetNumber(e.target.value)}
                                            />

                                            <label>Barangay <span className="required">*</span></label>
                                            <select 
                                                required 
                                                value={barangay}
                                                onChange={(e) => setBarangay(e.target.value)}
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

                                            <label>City</label>
                                            <input 
                                                type='text' 
                                                placeholder='Dagupan City' 
                                                required 
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                disabled
                                            />

                                            <label>Province</label>
                                            <input 
                                                type='text' 
                                                placeholder='Pangasinan' 
                                                required 
                                                value={province}
                                                onChange={(e) => setProvince(e.target.value)}
                                                disabled
                                            />

                                            <label>Region</label>
                                            <input 
                                                type='text' 
                                                placeholder='1' 
                                                required 
                                                value={region}
                                                onChange={(e) => setRegion(e.target.value)}
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div className='buttons'>
                                        <button type='reset' className='clear-button' onClick={handleClear}>
                                            Clear
                                        </button>
                                        <button type='submit' className='submit-button'>
                                            Submit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEvacCenter && selectedCenter && (
                <div className='evacuation-center-info-admin'>
                    <div className='evacuation-center-info-body'>
                    <div className='close-container'>
                            <button onClick={handleCloseSelectedCenter}>
                                <img src={close} alt='close' />
                            </button>
                        </div>

                        <div className='info'>
                            <div className='evac-img'>
                                <img 
                                    src={`http://localhost:3000/${selectedCenter.image}`} 
                                    alt={selectedCenter.name} 
                                    onError={(e) => e.target.src = evacCenter}
                                />
                            </div>
                            <div className='evac-text'>
                                <h2>{selectedCenter.name}</h2>
                                <p>
                                    Address: {selectedCenter.street}, {selectedCenter.barangay}, {selectedCenter.city}, {selectedCenter.province}
                                </p>
                                <p>Contact No.: {selectedCenter.staff_contact_number}</p>
                                <p>
                                    Capacity: {selectedCenter.taken_slots}/{selectedCenter.capacity}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default CreateEvacuationCenter