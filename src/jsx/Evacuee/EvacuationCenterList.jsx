import { useEffect, useState, useRef, useMemo } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

import homeActive from '../../assets/home-active.png'
import evacuationCenterActive from '../../assets/evacuation-center-active.png'
import requestActive from '../../assets/request-active.png'
import announcementsActive from '../../assets/announcements-active.png'
import notificationsActive from '../../assets/notification-active.png'
import settingsActive from '../../assets/settings-active.png'
import evacCenter from '../../assets/evac-center-placeholder.png'
import close from '../../assets/close.png'
import addCircle from '../../assets/add_circle.png'
import check from '../../assets/check.png'
import error from '../../assets/error.png'
import requestBtn from '../../assets/request-button.png'
import fulfilled from '../../assets/request_completed.png'
import pending from '../../assets/pending.png'
import denied from '../../assets/denied.png'

function EvacuationCenterList({
    currentEvac,
    currentCenters
}) {
    const [showEvacInfo, setShowEvacInfo] = useState(false);
    const [showCurrentEvac, setCurrentEvac] = useState(false);
    const [showAddFamily, setShowAddFamily] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPendingEvac, setShowPendingEvac] = useState(false);
    const [showResponse, setShowResponse] = useState(false);
    const [exitAnim, setExitAnim] = useState(false);
    
    const [selectedCenter, setSelectedCenter] = useState(null);

    const [pendingEvac, setPendingEvacuation] = useState([]);
    const [centers, setCenters] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [pendingCenters, setPendingCenters] = useState({});

    const [responseMessage, setResponseMessage] = useState("");
    const [responseType, setResponseType] = useState("success");
    const [activeFilter, setActiveFilter] = useState("all");

    const [numberOfFamilyMembers, setNumberOfFamilyMembers] = useState(0);
    
    const loadingTimeout = useRef(null);
    const showTimeout = useRef(null);
    const exitTimeout = useRef(null);
    const formRef = useRef(null);
    
    const clearAllTimeouts = () => {
        if (loadingTimeout.current) { clearTimeout(loadingTimeout.current); loadingTimeout.current = null; }
        if (showTimeout.current) { clearTimeout(showTimeout.current); showTimeout.current = null; }
        if (exitTimeout.current) { clearTimeout(exitTimeout.current); exitTimeout.current = null; }
    };

    
    const [newMember, setNewMember] = useState({
        firstName: '',
        lastName: '',
        sex: '',
        birthdate: '',
        address: '',
        medical: ''
    });

    const handleOpenEvacInfo = async (center) => {
        setSelectedCenter(center);
        setShowEvacInfo(true);
    
        try {
            const evacueeId = localStorage.getItem("evacueeId");
            const token = localStorage.getItem("evacueeToken");
            if (!evacueeId) {
                throw new Error("Evacuee ID not found. Please log in again.");
            }

            const response = await fetch(`http://localhost:3000/evacuee/${evacueeId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            const data = await response.json();
    
            const defaultMembers = Array.isArray(data) ? data : [data];

            const transformedMembers = defaultMembers.map(member => ({
                firstName: member.first_name,
                lastName: member.last_name,
                birthdate: member.birthdate,
                age: calculateAge(member.birthdate),
                sex: member.sex,
                address: `${member.street_number}, ${member.barangay}, ${member.city}, ${member.province}, ${member.country}`,
                medical: member.disabilities
            }));

            setFamilyMembers(transformedMembers);
    
        } catch (error) {
            console.error("Error fetching default family members:", error);
            setFamilyMembers([]);
        }
    };
    const handleCloseEvacInfo = () => setShowEvacInfo(false);

    const handleOpenCurrentEvac = (registration, center) => {
        setSelectedCenter(center);
        setCurrentEvac(true);
    };
    const handleCloseCurrentEvac = () => setCurrentEvac(false);

    const handleOpenPendingEvac = (registration, center) => {
        setSelectedCenter(center);
        setShowPendingEvac(true);
    };
    const handleClosePendingEvac = () => setShowPendingEvac(false);

    const handleOpenAddFamily = () => setShowAddFamily(true);
    const handleCloseAddFamily = () => setShowAddFamily(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMember((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const calculateAge = (birthdate) => {
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleAddFamily = (e) => {
        e.preventDefault();

        const fullName = `${newMember.firstName} ${newMember.lastName}`.trim();
        const age = calculateAge(newMember.birthdate);

        setFamilyMembers((prev) => [
            ...prev,
            {
                firstName: newMember.firstName, 
                lastName: newMember.lastName,
                sex: newMember.sex,
                birthdate: newMember.birthdate,
                age: age,
                address: newMember.address,
                medical: newMember.medical || 'None'
            }
        ]);

        setNewMember({
            firstName: '',
            lastName: '',
            sex: '',
            birthdate: '',
            address: '',
            medical: ''
        });
        setShowAddFamily(false);
    };

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

        const fetchPending = async () => {
            try {
                const evacueeId = localStorage.getItem("evacueeId");
                if (!evacueeId) return;
        
                const res = await fetch(`http://localhost:3000/evacuation-registration/pending/evacuee/${evacueeId}`);
                if (!res.ok) {
                    console.warn("No pending registrations found.");
                    setPendingEvacuation([]);
                    return;
                }
        
                const data = await res.json();
                setPendingEvacuation(data);
        
                const centers = {};
                for (const reg of data) {
                    if (!reg.evacuation_center_id) continue;
                    const centerRes = await fetch(`http://localhost:3000/evacuation-center/${reg.evacuation_center_id}`);
                    if (!centerRes.ok) continue;
                    const center = await centerRes.json();
                    centers[reg.evacuation_center_id] = center;
                }
                setPendingCenters(centers);
        
            } catch (error) {
                console.error("Error fetching pending registrations:", error);
                setPendingEvacuation([]);
            }
        };

        fetchPending();
        fetchCenters();

        const interval = setInterval(() => {
            fetchPending();
            fetchCenters();
        }, 5000);
    
        return () => clearInterval(interval);
    }, []);


    const handleRegister = async () => {
        clearAllTimeouts();
        setLoading(true);
        try {
            const evacueeId = localStorage.getItem("evacueeId");
            const token = localStorage.getItem("evacueeToken");
            if (!evacueeId) {
                throw new Error("Evacuee ID not found. Please log in again.");
            }

            const payload = {
                evacuee_id: evacueeId,
                evacuation_center_id: selectedCenter._id,
                number_of_family_members: numberOfFamilyMembers
            };

            const response = await fetch("http://localhost:3000/evacuation-registration/", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                 },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Registration failed");
            }

            setResponseMessage("Registration successful!");
            setResponseType("success");
            setShowResponse(true);

            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 4000);

            handleCloseEvacInfo();
        } catch (error) {
            console.error("Registration error:", error);

            setResponseMessage(error.message);
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
    };

    const handleDecreaseNumber = () => {
        if (numberOfFamilyMembers > 0) {
            setNumberOfFamilyMembers(numberOfFamilyMembers - 1);
        }
    }

    const handleIncreaseNumber = () => {
        setNumberOfFamilyMembers(numberOfFamilyMembers + 1);
    }


    return (
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
            </div>

            <div className='evacuation-centers-buttons'>
                <button 
                    className={activeFilter === 'all' ? 'active' : ''} 
                    onClick={() => setActiveFilter('all')}
                >
                    All
                </button>
                <button 
                    className={activeFilter === 'pending' ? 'active' : ''} 
                    onClick={() => setActiveFilter('pending')}
                >
                    Pending
                </button>
                <button 
                    className={activeFilter === 'current' ? 'active' : ''} 
                    onClick={() => setActiveFilter('current')}
                >
                    Current
                </button>
            </div>

            <div className='page-content-none'>
                {(activeFilter === 'current') && (
                    <div>
                        <h2>Current Center</h2>
                        <div className='current-center-root'>
                            {currentEvac.length > 0 ? (
                                currentEvac.map(reg => {
                                    const center = currentCenters[reg.evacuation_center_id];
                                    if (!center) return null;
                                    return (
                                        <div className='evacuation-center-card' key={reg._id}>
                                                <div className='evacuation-center-image'>
                                            <img 
                                                src={center.image ? `http://localhost:3000/${center.image}` : evacCenter} 
                                                alt='Evac center' 
                                            />
                                        </div>
                                        <div className='evacuation-center-details'>
                                            <h2>{center.name}</h2>
                                            <p>{center.street}, {center.barangay}, {center.city}, {center.province}</p>
                                            <p><span>{center.taken_slots}/{center.capacity}</span></p>
                                        </div>
                                        <br />
                                        <div className='view-button'>
                                            <button onClick={() => handleOpenCurrentEvac(reg, center)}>View</button>
                                        </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className='no-current-evac'>
                                    You are currently not registered in any evacuation centers.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {(activeFilter === 'pending') && (
                    <div>
                        <h2>Pending Registrations</h2>
                        <div className='current-center-root'>
                            {pendingEvac.length > 0 ? (
                                pendingEvac.map(reg => {
                                    const center = pendingCenters[reg.evacuation_center_id];
                                    if (!center) return null;
                                    return (
                                        <div className='evacuation-center-card' key={reg._id}>
                                                <div className='evacuation-center-image'>
                                            <img 
                                                src={center.image ? `http://localhost:3000/${center.image}` : evacCenter} 
                                                alt='Evac center' 
                                            />
                                        </div>
                                        <div className='evacuation-center-details'>
                                            <h2>{center.name}</h2>
                                            <p>{center.street}, {center.barangay}, {center.city}, {center.province}</p>
                                            <p><span>{center.taken_slots}/{center.capacity}</span></p>
                                        </div>
                                        <br />
                                        <div className='view-button'>
                                            <button onClick={() => handleOpenPendingEvac(reg, center)} disabled>Pending</button>
                                        </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className='no-current-evac'>
                                    You currently do not have any pending registrations.
                                </p>
                            )}
                        </div>
                    </div>
                )}


                {(activeFilter === 'all' || activeFilter === 'available') && (
                    <div>
                        <h2>Available Centers</h2>
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
                                            <button
                                                onClick={() => {
                                                    setSelectedCenter(center);
                                                    handleOpenEvacInfo(center);
                                                }}
                                            >
                                                Register
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showEvacInfo && selectedCenter && (
                <div className='evacuation-center-info'>
                    <div className='evacuation-center-info-body'>
                        <div className='close-container'>
                            <button onClick={handleCloseEvacInfo}>
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
                                <p>Staff: {selectedCenter.staff_name}</p>
                                <p>Contact No.: {selectedCenter.staff_contact_number}</p>
                                <p>
                                    Capacity: {selectedCenter.taken_slots}/{selectedCenter.capacity}
                                </p>
                            </div>
                        </div>

                        <div className='family-members-section'>
                            <h2>Number of Family Members</h2>
                            <div className='family-members-table-root'>
                                <button onClick={handleDecreaseNumber}>-</button>
                                <h2>{numberOfFamilyMembers}</h2>
                                <button onClick={handleIncreaseNumber}>+</button>
                            </div>
                        </div>

                        <div className='buttons'>
                            <button className='cancel-button' onClick={handleCloseEvacInfo}>
                                Cancel
                            </button>
                            <button className='register-button' onClick={handleRegister}>Register</button>
                        </div>
                    </div>
                </div>
            )}

            {showCurrentEvac && selectedCenter && (
                <div className='evacuation-center-info'>
                    <div className='evacuation-center-info-body'>
                    <div className='close-container'>
                            <button onClick={handleCloseCurrentEvac}>
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
                                <p>Staff: {selectedCenter.staff_name}</p>
                                <p>Contact No.: {selectedCenter.staff_contact_number}</p>
                                <p>
                                    Capacity: {selectedCenter.taken_slots}/{selectedCenter.capacity}
                                </p>
                            </div>
                        </div>

                        <div className='buttons'>
                            <button className='cancel-button' onClick={handleCloseCurrentEvac}>
                                Cancel
                            </button>
                            <button className='leave-button'>Leave</button>
                        </div>
                    </div>
                </div>
            )}

            {showPendingEvac && selectedCenter && (
                <div className='evacuation-center-info'>
                    <div className='evacuation-center-info-body'>
                    <div className='close-container'>
                            <button onClick={handleClosePendingEvac}>
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
                                <p>Staff: {selectedCenter.staff_name}</p>
                                <p>Contact No.: {selectedCenter.staff_contact_number}</p>
                                <p>
                                    Capacity: {selectedCenter.taken_slots}/{selectedCenter.capacity}
                                </p>
                            </div>
                        </div>

                        <div className='family-members-section'>
                            <h2>Family Members</h2>
                            <div className='family-members-table-root'>
                                
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAddFamily && (
                <div className='add-family'>
                    <div className='add-family-body'>
                        <div className='close-container'>
                            <button onClick={handleCloseAddFamily}>
                                <img src={close} alt='close' />
                            </button>
                        </div>
                        <div className='family-members'>
                            <h2>Add Family Member</h2>

                            <form onSubmit={handleAddFamily}>
                                <div className='names'>
                                    <div className='first-name'>
                                        <label>First Name</label>
                                        <input
                                            type='text'
                                            name='firstName'
                                            placeholder='John'
                                            value={newMember.firstName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className='last-name'>
                                        <label>Last Name</label>
                                        <input
                                            type='text'
                                            name='lastName'
                                            placeholder='Doe'
                                            value={newMember.lastName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className='input-fields'>
                                    <label>Sex</label>
                                    <select
                                        name='sex'
                                        value={newMember.sex}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value=''>Select Option</option>
                                        <option value='male'>Male</option>
                                        <option value='female'>Female</option>
                                    </select>

                                    <label>Birthdate</label>
                                    <input
                                        type='date'
                                        name='birthdate'
                                        value={newMember.birthdate}
                                        onChange={handleInputChange}
                                        max={new Date().toISOString().split('T')[0]}
                                        required
                                    />

                                    <label>Address</label>
                                    <input
                                        type='text'
                                        name='address'
                                        placeholder='123 Apple St., Bari, Mangaldan, Pangasinan'
                                        value={newMember.address}
                                        onChange={handleInputChange}
                                        required
                                    />

                                    <label>Medical Conditions</label>
                                    <select
                                        name='medical'
                                        value={newMember.medical}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value=''>Select Option</option>
                                        <option value='Arthritis'>Arthritis</option>
                                        <option value='Heart Failure'>Heart Failure</option>
                                    </select>
                                </div>

                                <div className='buttons'>
                                    <button type='button' className='cancel-button' onClick={handleCloseAddFamily}>
                                        Cancel
                                    </button>
                                    <button type='submit' className='register-button'>
                                        Register
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default EvacuationCenterList