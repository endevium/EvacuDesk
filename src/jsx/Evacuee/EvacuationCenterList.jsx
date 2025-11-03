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
    const [recommendedCenters, setRecommendedCenters] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [selectedPending, setSelectedPending] = useState(null);
    const [areas, setAreas] = useState([]);
    const [showAreas, setShowAreas] = useState(false);
    const [pendingCenters, setPendingCenters] = useState({});
    const [responseMessage, setResponseMessage] = useState("");
    const [responseType, setResponseType] = useState("success");
    const [activeFilter, setActiveFilter] = useState("all");
    const evacueeId = localStorage.getItem("evacueeId");
    
    const [newMember, setNewMember] = useState({
        firstName: '', lastName: '', sex: '', birthdate: '', address: '', medical: ''
    });

    const [numberOfFamilyMembers, setNumberOfFamilyMembers] = useState({
        infants: 0,
        children: 0,
        teens: 0,
        adults: 0,
        seniors: 0,
        pregnant: 0,
        pwd: 0,
    });
    const [needPickup, setNeedPickup] = useState("");

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

    // Open Pending Evac Modal
    const handleOpenPendingEvac = (reg) => {
        const center = pendingCenters[reg.evacuation_center_id];
        setSelectedPending(reg);                            
        setSelectedCenter(center);                               
        setShowPendingEvac(true);
    };  

    // Close Pending Evac Modal
    const handleClosePendingEvac = () => {
        setShowPendingEvac(false);
        setSelectedCenter(null);
        setSelectedPending(null);
    };

    const handleCloseEvacInfo = () => {
        setShowEvacInfo(false);
        setSelectedCenter(null);
        setNeedPickup("");
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

            const totalMembers = Object.values(numberOfFamilyMembers).reduce((a, b) => a + b, 0);

            if (totalMembers === 0) {
                showResponseMessage("Please enter at least one family member.", "error");
                return;
            }

            if (needPickup === "") {
                showResponseMessage("Please select whether you need pickup assistance.", "error");
                return;
            }

            const payload = {
                evacuee_id: evacueeId,
                evacuation_center_id: selectedCenter._id,
                number_of_family_members: totalMembers,
                infants: numberOfFamilyMembers.infants,
                childrens: numberOfFamilyMembers.children,
                teens: numberOfFamilyMembers.teens,
                adults: numberOfFamilyMembers.adults,
                seniors: numberOfFamilyMembers.seniors,
                pregnant: numberOfFamilyMembers.pregnant,
                pwd: numberOfFamilyMembers.pwd,
                for_pickup: needPickup,
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

    const handleCancelRegistration = async (id) => {
        try {
            const evacueeId = localStorage.getItem("evacueeId");
            const token = localStorage.getItem("evacueeToken");
            if (!evacueeId) throw new Error("Evacuee ID not found.");

            const response = await fetch(
                `http://localhost:3000/evacuation-registration/delete/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    }
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to cancel registration");

            showResponseMessage("Registration successfully cancelled", "success");
            
            handleCloseCurrentEvac();
            handleClosePendingEvac();
            setSelectedCenter(null);
            setSelectedPending(null);
        } catch (error) {
            console.error("Error leaving evacuation:", error);
            showResponseMessage(error.message, "error");
        }
    };

    const handleIncreaseNumber = (type) => {
        setNumberOfFamilyMembers((prev) => ({
          ...prev,
          [type]: prev[type] + 1,
        }));
    };
      
    const handleDecreaseNumber = (type) => {
        setNumberOfFamilyMembers((prev) => ({
            ...prev,
            [type]: prev[type] > 0 ? prev[type] - 1 : 0,
        }));
    };

    // Data fetching for centers and pending registrations
    useEffect(() => {
        const fetchCenters = async () => {
            try {
                const response = await fetch('http://localhost:3000/evacuation-center/');
                const data = await response.json();

                setCenters(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching centers:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchRecommendedCenters = async () => {
            try {
                const evacueeId = localStorage.getItem("evacueeId");
                const token = localStorage.getItem("evacueeToken");

                const response = await fetch(`http://localhost:3000/evacuee/recommended-center/${evacueeId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                const data = await response.json();
                
                console.log(data);
                setRecommendedCenters(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching recommended centers: ', error);
                setRecommendedCenters([]);
            } finally {
                setLoading(false);
            }
        }

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
          

        const fetchAll = () => {
            fetchCenters();
            fetchRecommendedCenters();
            fetchPending();
        };
    
        fetchAll();
    
        const interval = setInterval(fetchAll, 5000);
        return () => clearInterval(interval);
    }, []);

    // Safe image URL getter
    const getImageUrl = (center) => {
        if (!center?.image) return evacCenter;
        return `http://localhost:3000/${center.image}`;
    };

    // fetch areas
    const getAreas = async () => {
        try {
            const res = await fetch(`http://localhost:3000/center-area/center/${currentCenter._id}`, {
                method: "GET",
            })

            if (!res.ok) {
                setAreas([]);
                throw new Error("Failed to fetch areas");
            }
            
            const data = await res.json();
            setAreas(data);
        } catch (error) {
            console.error("Error fetching areas:", error);
        }
    }

    const handleShowAreas = () => {
        getAreas();
        setShowAreas(true);
    }

    const handleCloseShowAreas = () => {
        setAreas([]);
        setShowAreas(false);
    }

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
                    className={activeFilter === value ? 'active-filter' : ''} 
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
                const center = pendingCenters[reg.evacuation_center_id]; // ✅ use pendingCenters map
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
                      <p>Status: Pending</p>
                    </div>
                    <br />
                    <div className='view-button'>
                      <button onClick={() => handleOpenPendingEvac(reg)}>View</button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className='no-current-evac'>
                You currently do not have any pending registrations.
              </p>
            )}
          </div>
        </div>
    );
      
      

    const renderAvailableCenters = () => (
        <div>
            <h2>Recommended Centers</h2>
            {loading ? (
                <p>Loading recommended evacuation centers...</p>
                ) : recommendedCenters.length === 0 ? (
                <p className='no-current-evac'>No recommended centers found.</p>
                ) : (
                <div className='evacuation-centers-root'>
                    {recommendedCenters.map(center => (
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
                    ))}
                </div>
            )}


            <h2>Available Centers</h2>
            {loading ? (
                <p>Loading evacuation centers...</p>
                ) : centers.length === 0 ? (
                <p className='no-current-evac'>No evacuation centers found.</p>
                ) : (
                <div className='evacuation-centers-root'>
                    {centers.map(center => (
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
                    ))}
                </div>
                )}
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
                    <p>Contact No.: {selectedCenter?.staff_contact_number}</p>
                    <p>Capacity: {selectedCenter?.taken_slots}/{selectedCenter?.capacity}</p>
                </div>

                <div className='family-members-section'>
                <h2>Number of Family Members</h2>
                <div className='family-members-table-root'>
                    {Object.entries(numberOfFamilyMembers).map(([key, value]) => (
                        <div key={key} className='family-member'>
                            <p>{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                            <button onClick={() => handleDecreaseNumber(key)}>-</button>
                            <h2>{value}</h2>
                            <button onClick={() => handleIncreaseNumber(key)}>+</button>
                        </div>
                    ))}
                </div>

                <br />

                <div className='family-members-section'>
                    <h2>Need Pickup?</h2>
                    <div className='radio-buttons'>
                        <label>
                        <input
                            type="radio"
                            name="needPickup"
                            value="Yes"
                            checked={needPickup === "Yes"}
                            onChange={() => setNeedPickup("Yes")}
                        />
                        Yes
                        </label>
                        <label>
                        <input
                            type="radio"
                            name="needPickup"
                            value="No"
                            checked={needPickup === "No"}
                            onChange={() => setNeedPickup("No")}
                        />
                        No
                        </label>
                    </div>
                </div>
            </div>
            </div>

            

            <div className='buttons'>
                <button className='cancel-button' onClick={handleCloseEvacInfo}>Cancel</button>
                <button className='register-button' onClick={handleRegister}>Register</button>
            </div>
        </>
    );

    const renderPendingEvacModal = () => renderCenterModal(showPendingEvac, handleClosePendingEvac,
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
                    <p>Contact No.: {selectedCenter?.staff_contact_number}</p>
                    
                    {selectedPending && (
                        <>
                            <p>Registration Date: {new Date(selectedPending.createdAt).toLocaleDateString()}</p>
                            <p>Number of Family Members: {selectedPending.number_of_family_members}</p>
                            <p>Infants: {selectedPending.infants}</p>
                            <p>Children: {selectedPending.childrens}</p>
                            <p>Teens: {selectedPending.teens}</p>
                            <p>Adults: {selectedPending.adults}</p>
                            <p>Seniors: {selectedPending.seniors}</p>
                            <p>PWD: {selectedPending.pwd}</p>
                            <p>Need Pickup: {selectedPending.for_pickup}</p>
                        </>
                    )}
                </div>
            </div>
    
            <div className='buttons'>
                <button className='cancel-button' onClick={handleClosePendingEvac}>Close</button>
                <button className='close-button' onClick={() => handleCancelRegistration(selectedPending._id)}>Cancel</button>
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
                    <p>Contact No.: {selectedCenter?.staff_contact_number}</p>
                    <p>Capacity: {selectedCenter?.taken_slots}/{selectedCenter?.capacity}</p>
                    {currentEvac && (
                        <p>Registration Date: {new Date(currentEvac.date_joined).toLocaleDateString()}</p>
                    )}
                    {currentEvac && (
                        <>
                            <p>Number of Family Members: {currentEvac.number_of_family_members}</p>
                            <p>Infants: {currentEvac.infants}</p>
                            <p>Children: {currentEvac.childrens}</p>
                            <p>Teens: {currentEvac.teens}</p>
                            <p>Adults: {currentEvac.adults}</p>
                            <p>Seniors: {currentEvac.seniors}</p>
                            <p>PWD: {currentEvac.pwd}</p>
                            <p>Assigned Area: {currentEvac.assigned_area?.area_name || "N/A"}</p>
                        </>
                    )}
                    
                </div>
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

    const renderViewAreasModel = () => (
        showAreas && (
            <div className='view-areas'>
                <div className='view-areas-body'>
                    <div className='close-container'>
                        <button onClick={handleCloseShowAreas}>
                            <img src={close} alt='close' />
                        </button>
                    </div>

                    <div className='view-area'>
                        <h2>View Areas</h2>
                        <div className='areas-root'>
                            {areas.map(area => {
                                const evacueeInside = area.occupants?.some(
                                occ => occ.evacuee_id?._id === evacueeId
                                );

                                const areaClass = evacueeInside
                                ? "current-area"
                                : area.current_occupancy > 0
                                ? "occupied-area"
                                : "area";

                                return (
                                    <div key={area._id} className={areaClass}>
                                        <p>{area.area_number}</p>
                                    </div>
                                );
                            })}  
                        </div>
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
            {renderViewAreasModel()}
            {renderPendingEvacModal()}

        </>
    );
}

export default EvacuationCenterList;