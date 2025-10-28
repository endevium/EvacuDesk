import { useEffect, useState, useRef } from 'react';
import evacuationCenterActive from '../../assets/evacuation-center-active.png';
import evacCenter from '../../assets/evac-center-placeholder.png';
import close from '../../assets/close.png';
import check from '../../assets/check.png';
import error from '../../assets/error.png';

function EvacuationCenterList({ currentEvac, currentCenter }) {
    // State declarations
    const [showEvacInfo, setShowEvacInfo] = useState(false);
    const [showCurrentEvac, setShowCurrentEvac] = useState(false);
    const [showAddFamily, setShowAddFamily] = useState(false);
    const [showPendingEvac, setShowPendingEvac] = useState(false);
    const [showResponse, setShowResponse] = useState(false);
    const [exitAnim, setExitAnim] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [pendingEvac, setPendingEvacuation] = useState([]);
    const [centers, setCenters] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [pendingCenters, setPendingCenters] = useState({});
    const [responseMessage, setResponseMessage] = useState("");
    const [responseType, setResponseType] = useState("success");
    const [activeFilter, setActiveFilter] = useState("all");
    const [numberOfFamilyMembers, setNumberOfFamilyMembers] = useState(0);
    
    const [newMember, setNewMember] = useState({
        firstName: '', lastName: '', sex: '', birthdate: '', address: '', medical: ''
    });

    // Refs
    const loadingTimeout = useRef(null);
    const showTimeout = useRef(null);
    const exitTimeout = useRef(null);

    // Constants
    const FILTERS = {
        ALL: 'all',
        PENDING: 'pending',
        CURRENT: 'current'
    };

    const hasActiveEvacuation = currentEvac && 
                            currentEvac.status === "Active" && 
                            currentEvac.isActive !== false && 
                            currentCenter;

    // Utility functions
    const clearAllTimeouts = () => {
        [loadingTimeout, showTimeout, exitTimeout].forEach(timeoutRef => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        });
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

    const showResponseMessage = (message, type = "success") => {
        setResponseMessage(message);
        setResponseType(type);
        setShowResponse(true);

        showTimeout.current = setTimeout(() => {
            setExitAnim(true);
            exitTimeout.current = setTimeout(() => {
                setShowResponse(false);
                setExitAnim(false);
            }, 400);
        }, 4000);
    };

    // Handler functions
    const handleOpenEvacInfo = async (center) => {
        setSelectedCenter(center);
        setShowEvacInfo(true);
    
        try {
            const evacueeId = localStorage.getItem("evacueeId");
            const token = localStorage.getItem("evacueeToken");
            if (!evacueeId) throw new Error("Evacuee ID not found.");

            const response = await fetch(`http://localhost:3000/evacuee/${evacueeId}`, {
                headers: { "Authorization": `Bearer ${token}` },
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
            console.error("Error fetching family members:", error);
            setFamilyMembers([]);
        }
    };

    const handleCloseEvacInfo = () => {
        setShowEvacInfo(false);
        setSelectedCenter(null);
    };

    const handleOpenCurrentEvac = () => {
        if (hasActiveEvacuation) {
            setSelectedCenter(currentCenter);
            setShowCurrentEvac(true);
        }
    };

    const handleCloseCurrentEvac = () => {
        setShowCurrentEvac(false);
        setSelectedCenter(null);
    };

    const handleClosePendingEvac = () => {
        setShowPendingEvac(false);
        setSelectedCenter(null);
    };

    const handleOpenAddFamily = () => setShowAddFamily(true);
    const handleCloseAddFamily = () => setShowAddFamily(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMember(prev => ({ ...prev, [name]: value }));
    };

    const handleAddFamily = (e) => {
        e.preventDefault();
        const age = calculateAge(newMember.birthdate);

        setFamilyMembers(prev => [
            ...prev,
            { ...newMember, age, medical: newMember.medical || 'None' }
        ]);

        setNewMember({ firstName: '', lastName: '', sex: '', birthdate: '', address: '', medical: '' });
        setShowAddFamily(false);
    };

    const handleRegister = async () => {
        clearAllTimeouts();
        setLoading(true);
        
        try {
            const evacueeId = localStorage.getItem("evacueeId");
            const token = localStorage.getItem("evacueeToken");
            if (!evacueeId) throw new Error("Evacuee ID not found.");

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
            if (!response.ok) throw new Error(data.error || "Registration failed");

            showResponseMessage("Registration successful!", "success");
            handleCloseEvacInfo();
        } catch (error) {
            console.error("Registration error:", error);
            showResponseMessage(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveEvacuation = async () => {
        try {
            const token = localStorage.getItem("evacueeToken");
            
            if (!currentEvac || !currentEvac._id) {
                throw new Error("No active evacuation found");
            }

            const response = await fetch(
                `http://localhost:3000/evacuation-center-occupant/status/${currentEvac._id}`, 
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: "Left" }),
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to update status");

            showResponseMessage("You have successfully left the evacuation center.", "success");
            
            showTimeout.current = setTimeout(() => {
                handleCloseCurrentEvac();
                window.location.reload();
            }, 4000);
        } catch (error) {
            console.error("Error leaving evacuation:", error);
            showResponseMessage(error.message, "error");
        }
    };

    const handleDecreaseNumber = () => {
        if (numberOfFamilyMembers > 0) {
            setNumberOfFamilyMembers(prev => prev - 1);
        }
    };

    const handleIncreaseNumber = () => {
        setNumberOfFamilyMembers(prev => prev + 1);
    };

    // Data fetching for centers and pending registrations
    useEffect(() => {
        const fetchCenters = async () => {
            try {
                const response = await fetch('http://localhost:3000/evacuation-center/');
                const data = await response.json();
                setCenters(data);
            } catch (error) {
                console.error('Error fetching centers:', error);
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
                    setPendingEvacuation([]);
                    return;
                }
        
                const data = await res.json();
                setPendingEvacuation(data);
        
                const centersMap = {};
                for (const reg of data) {
                    if (!reg.evacuation_center_id) continue;
                    try {
                        const centerRes = await fetch(`http://localhost:3000/evacuation-center/${reg.evacuation_center_id}`);
                        if (centerRes.ok) {
                            const center = await centerRes.json();
                            centersMap[reg.evacuation_center_id] = center;
                        }
                    } catch (err) {
                        console.warn(`Failed to fetch center ${reg.evacuation_center_id}:`, err);
                    }
                }
                setPendingCenters(centersMap);
            } catch (error) {
                console.error("Error fetching pending:", error);
                setPendingEvacuation([]);
            }
        };

        fetchCenters();
        fetchPending();
    }, []);

    // Safe image URL getter
    const getImageUrl = (center) => {
        if (!center?.image) return evacCenter;
        return `http://localhost:3000/${center.image}`;
    };

    // Component render functions
    const renderResponsePopup = () => (
        showResponse && (
            <div className={`response-body ${responseType} ${exitAnim ? "exit" : ""}`} role="status" aria-live="polite">
                <img src={responseType === "success" ? check : error} alt={responseType} />
                <p>{responseMessage}</p>
            </div>
        )
    );

    const renderLoadingOverlay = () => (
        loading && (
            <div className="loading-overlay" aria-hidden="true">
                <div className="spinner" />
            </div>
        )
    );

    const renderPageHeader = () => (
        <div className='page-label'>
            <div className='page-icon'>
                <img src={evacuationCenterActive} alt='icon' />
            </div>
            <div className='page-label-text'>
                <p>Evacuation Centers</p>
            </div>
        </div>
    );

    const renderFilterButtons = () => (
        <div className='evacuation-centers-buttons'>
            {Object.entries(FILTERS).map(([key, value]) => (
                <button 
                    key={value}
                    className={activeFilter === value ? 'active' : ''} 
                    onClick={() => setActiveFilter(value)}
                >
                    {key.charAt(0) + key.slice(1).toLowerCase()}
                </button>
            ))}
        </div>
    );

    const renderCurrentCenter = () => {
        // console.log("Rendering current center - hasActiveEvacuation:", hasActiveEvacuation);
        // console.log("currentEvac:", currentEvac);
        // console.log("currentCenter:", currentCenter);
        
        return (
            <div>
                <h2>Current Center</h2>
                <div className='current-center-root'>
                    {hasActiveEvacuation ? (
                        <div className='evacuation-center-card'>
                            <div className='evacuation-center-image'>
                                <img 
                                    src={getImageUrl(currentCenter)} 
                                    alt='Evac center' 
                                    onError={(e) => { e.target.src = evacCenter; }}
                                />
                            </div>
                            <div className='evacuation-center-details'>
                                <h2>{currentCenter.name}</h2>
                                <p>{currentCenter.street}, {currentCenter.barangay}, {currentCenter.city}, {currentCenter.province}</p>
                                <p><span>{currentCenter.taken_slots}/{currentCenter.capacity}</span></p>
                            </div>
                            <br />
                            <div className='view-button'>
                                <button onClick={handleOpenCurrentEvac}>View</button>
                            </div>
                        </div>
                    ) : (
                        <p className='no-current-evac'>You are currently not registered in any evacuation centers.</p>
                    )}
                </div>
            </div>
        );
    };

    const renderPendingRegistrations = () => (
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
                                        src={getImageUrl(center)} 
                                        alt='Evac center' 
                                        onError={(e) => { e.target.src = evacCenter; }}
                                    />
                                </div>
                                <div className='evacuation-center-details'>
                                    <h2>{center.name}</h2>
                                    <p>{center.street}, {center.barangay}, {center.city}, {center.province}</p>
                                    <p><span>{center.taken_slots}/{center.capacity}</span></p>
                                </div>
                                <br />
                                <div className='view-button'>
                                    <button disabled>Pending</button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className='no-current-evac'>You currently do not have any pending registrations.</p>
                )}
            </div>
        </div>
    );

    const renderAvailableCenters = () => (
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
                                    src={getImageUrl(center)}
                                    alt={center.name}
                                    onError={(e) => { e.target.src = evacCenter; }}
                                />
                            </div>
                            <div className='evacuation-center-details'>
                                <h2>{center.name}</h2>
                                <p>{center.street}, {center.barangay}, {center.city}, {center.province}</p>
                                <p><span>{center.taken_slots}/{center.capacity}</span></p>
                            </div>
                            <br/>
                            <div className='evacuation-button'>
                                <button onClick={() => handleOpenEvacInfo(center)}>
                                    Register
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderCenterModal = (show, onClose, children) => (
        show && selectedCenter && (
            <div className='evacuation-center-info'>
                <div className='evacuation-center-info-body'>
                    <div className='close-container'>
                        <button onClick={onClose}>
                            <img src={close} alt='close' />
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        )
    );

    const renderEvacInfoModal = () => renderCenterModal(showEvacInfo, handleCloseEvacInfo,
        <>
            <div className='info'>
                <div className='evac-img'>
                    <img 
                        src={getImageUrl(selectedCenter)} 
                        alt={selectedCenter?.name || 'Evacuation Center'} 
                        onError={(e) => e.target.src = evacCenter}
                    />
                </div>
                <div className='evac-text'>
                    <h2>{selectedCenter?.name}</h2>
                    <p>Address: {selectedCenter?.street}, {selectedCenter?.barangay}, {selectedCenter?.city}, {selectedCenter?.province}</p>
                    <p>Staff: {selectedCenter?.staff_name}</p>
                    <p>Contact No.: {selectedCenter?.staff_contact_number}</p>
                    <p>Capacity: {selectedCenter?.taken_slots}/{selectedCenter?.capacity}</p>
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
                <button className='cancel-button' onClick={handleCloseEvacInfo}>Cancel</button>
                <button className='register-button' onClick={handleRegister}>Register</button>
            </div>
        </>
    );

    const renderCurrentEvacModal = () => renderCenterModal(showCurrentEvac, handleCloseCurrentEvac,
        <>
            <div className='info'>
                <div className='evac-img'>
                    <img 
                        src={getImageUrl(selectedCenter)} 
                        alt={selectedCenter?.name || 'Evacuation Center'} 
                        onError={(e) => e.target.src = evacCenter}
                    />
                </div>
                <div className='evac-text'>
                    <h2>{selectedCenter?.name}</h2>
                    <p>Address: {selectedCenter?.street}, {selectedCenter?.barangay}, {selectedCenter?.city}, {selectedCenter?.province}</p>
                    <p>Staff: {selectedCenter?.staff_name}</p>
                    <p>Contact No.: {selectedCenter?.staff_contact_number}</p>
                    <p>Capacity: {selectedCenter?.taken_slots}/{selectedCenter?.capacity}</p>
                    {currentEvac && (
                        <p>Registration Date: {new Date(currentEvac.date_joined).toLocaleDateString()}</p>
                    )}
                    {currentEvac && (
                        <p>Family Members: {currentEvac.number_of_family_members}</p>
                    )}
                </div>
            </div>

            <div className='buttons'>
                <button className='cancel-button' onClick={handleCloseCurrentEvac}>Cancel</button>
                <button className='leave-button' onClick={handleLeaveEvacuation}>Leave</button>
            </div>
        </>
    );

    const renderAddFamilyModal = () => (
        showAddFamily && (
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
                                <select name='sex' value={newMember.sex} onChange={handleInputChange} required>
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
                                <select name='medical' value={newMember.medical} onChange={handleInputChange} required>
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
        )
    );

    return (
        <>  
            {renderResponsePopup()}
            {renderLoadingOverlay()}
            {renderPageHeader()}
            {renderFilterButtons()}

            <div className='page-content-none'>
                {activeFilter === FILTERS.CURRENT && renderCurrentCenter()}
                {activeFilter === FILTERS.PENDING && renderPendingRegistrations()}
                {(activeFilter === FILTERS.ALL || activeFilter === 'available') && renderAvailableCenters()}
            </div>

            {renderEvacInfoModal()}
            {renderCurrentEvacModal()}
            {renderAddFamilyModal()}
        </>
    );
}

export default EvacuationCenterList;