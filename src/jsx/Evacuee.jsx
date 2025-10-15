import '../css/evacuee.css'
import { useEffect, useState, useRef, useMemo } from 'react';

import EvacueeSideNav from './EvacueeSideNav'
import EvacueeHeader from './EvacueeHeader'
import homeActive from '../assets/home-active.png'
import evacuationCenterActive from '../assets/evacuation-center-active.png'
import requestActive from '../assets/request-active.png'
import announcementsActive from '../assets/announcements-active.png'
import notificationsActive from '../assets/notification-active.png'
import settingsActive from '../assets/settings-active.png'
import evacCenter from '../assets/evac-center-placeholder.png'
import close from '../assets/close.png'
import addCircle from '../assets/add_circle.png'
import check from '../assets/check.png'
import error from '../assets/error.png'
import requestBtn from '../assets/request-button.png'

import fulfilled from '../assets/request_completed.png'
import pending from '../assets/pending.png'
import denied from '../assets/denied.png'

import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';


function Evacuee() {
    const [activeMenu, setActiveMenu] = useState('home'); 
    const [currentEvac, setCurrentEvacuation] = useState([]);
    const [currentCenters, setCurrentCenters] = useState({});

    useEffect(() => {
        const fetchCurrent = async () => {
            try {
                const evacueeId = localStorage.getItem("evacueeId");
                const token = localStorage.getItem("evacueeToken");
                if (!evacueeId) {
                    console.warn("Evacuee ID not found.");
                    setCurrentEvacuation([]);
                    setCurrentCenters({});
                    return;
                }
    
                const res = await fetch(`http://localhost:3000/evacuation-registration/approved/evacuee/${evacueeId}`);
    
                if (!res.ok) {
                    console.warn("No approved registrations found.");
                    setCurrentEvacuation([]);
                    setCurrentCenters({});
                    return;
                }
    
                const data = await res.json();
                if (!Array.isArray(data) || data.length === 0) {
                    setCurrentEvacuation([]);
                    setCurrentCenters({});
                    return;
                }
    
                setCurrentEvacuation(data);
    
                const centerData = {};
                for (const reg of data) {
                    if (!reg.evacuation_center_id) continue;
    
                    try {
                        const centerRes = await fetch(`http://localhost:3000/evacuation-center/${reg.evacuation_center_id}`);
                        if (!centerRes.ok) continue;
                        const center = await centerRes.json();
                        centerData[reg.evacuation_center_id] = center;
                    } catch (err) {
                        console.warn(`Failed to fetch center ${reg.evacuation_center_id}:`, err);
                        continue;
                    }
                }
    
                setCurrentCenters(centerData);
    
            } catch (error) {
                console.error("Error fetching current center:", error);
                setCurrentEvacuation([]);
                setCurrentCenters({});
            }
        };
        
        fetchCurrent();

        const interval = setInterval(fetchCurrent, 5000);
    
        return () => clearInterval(interval);
    }, []);

    const renderPage = () => {
        switch (activeMenu) {
        case 'home':
            return <EvacueeHome />;
        case 'evacuation-center':
            return <EvacuationCenterList 
                currentEvac={currentEvac} 
                currentCenters={currentCenters}  
            />;
        case 'request':
            return <EvacueeRequest 
                currentEvac={currentEvac}
                setActiveMenu={setActiveMenu}
            />;
        case 'announcements':
            return <EvacueeAnnouncements 
            currentEvac={currentEvac} 
            setActiveMenu={setActiveMenu} />;
        case 'notifications':
            return <EvacueeNotifications />;
        case 'settings':
            return <EvacueeSettings />;
        default:
            return <EvacueeHome />;
        }
    };

    return (
        <>
            <div className='evacuee'>
                <div className='evacuee-side'>
                <EvacueeSideNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
                </div>
                <div className='evacuee-body-root'>
                <EvacueeHeader />
                <div className='evacuee-body'>
                    {renderPage()}
                </div>
                </div>
            </div>
        </>
    );
}

function EvacueeHome() {
    const lineData = useMemo(
        () => [
            { month: "Jan", requests: 5 },
            { month: "Feb", requests: 12 },
            { month: "Mar", requests: 8 },
            { month: "Apr", requests: 15 },
            { month: "May", requests: 20 },
            { month: "Jun", requests: 10 },
        ],
        []
    );

    const pieData = useMemo(
        () => [
            { name: "Occupied", value: 300 },
            { name: "Available", value: 200 },
        ],
        []
    );

    const pieColors = ['#45AD7F', '#E0E0E0'];

    return(
        <>
            <div className='page-label'>
                <div className='page-icon'>
                    <img src={homeActive}/>
                </div>
                <div className='page-label-text'>
                    <p>Home</p>
                </div>
            </div>
            <div className='page-content'>
                <h2>Requests Overview</h2>
                <div className='dashboard-mini-root'>
                    <div className='dashboard-mini-card'>
                        <div className='dashboard-mini-icon'>
                            <h2>Fulfilled</h2>
                            <img src={fulfilled}/>
                        </div>

                        <p>0</p>
                    </div>

                    <div className='dashboard-mini-card'>
                        <div className='dashboard-mini-icon'>
                            <h2>Pending</h2>
                            <img src={pending}/>
                        </div>
                        
                        <p>0</p>
                    </div>

                    <div className='dashboard-mini-card'>
                        <div className='dashboard-mini-icon'>
                            <h2>Declined</h2>
                            <img src={denied}/>
                        </div>
                        <p>0</p>
                    </div>
                </div>
                <br/>
                <div className='charts'>
                    <div className='line-graph'>
                        <h2>Aid History</h2>
                        <div className='graph-root'>
                            <ResponsiveContainer width="95%" height="90%">
                                <LineChart data={lineData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="requests" stroke="#45AD7F" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className='pie-chart'>
                        <h2>Center Occupancy vs Capacity</h2>
                        <div className='graph-root'>
                            <ResponsiveContainer width="95%" height="90%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

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
        setFamilyMembers(registration.family_members.map(member => ({
            firstName: member.first_name,
            lastName: member.last_name,
            age: calculateAge(member.birthdate),
            sex: member.sex,
            address: member.address,
            medical: member.medical_conditions
        })));
        setCurrentEvac(true);
    };

    const handleCloseCurrentEvac = () => setCurrentEvac(false);
    const handleOpenPendingEvac = (registration, center) => {
        setSelectedCenter(center);
        setFamilyMembers(registration.family_members.map(member => ({
            firstName: member.first_name,
            lastName: member.last_name,
            age: calculateAge(member.birthdate),
            sex: member.sex,
            address: member.address,
            medical: member.medical_conditions
        })));
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
                family_members: familyMembers.map(member => ({
                    first_name: member.firstName,
                    last_name: member.lastName,
                    sex: member.sex,
                    birthdate: member.birthdate,
                    address: member.address,
                    medical_conditions: member.medical,
                })),
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

            <div className='page-content-none'>
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
                                        <p>Capacity: {center.capacity}</p>
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
                                        <p>Capacity: {center.capacity}</p>
                                    </div>
                                    <br />
                                    <div className='view-button'>
                                        <button onClick={() => handleOpenPendingEvac(reg, center)}>View</button>
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
                                    <p>{center.taken_slots}/{center.capacity}</p>
                                </div>
                                <br/>
                                <div className='evacuation-button'>
                                <button onClick={() => {
                                    setSelectedCenter(center);
                                    handleOpenEvacInfo(center);
                                }}>
                                    Register
                                </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
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
                            <h2>Family Members</h2>
                            <div className='family-members-table-root'>
                                <table className='family-members-table'>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Sex</th>
                                            <th>Age</th>
                                            <th>Address</th>
                                            <th>Medical Conditions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {familyMembers.map((member, index) => (
                                            <tr key={index}>
                                                <td>{`${member.firstName} ${member.lastName}`}</td>
                                                <td>{member.sex}</td>
                                                <td>{member.age}</td>
                                                <td>{member.address}</td>
                                                <td>{member.medical}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <button className='add-button' onClick={handleOpenAddFamily}>
                                <img src={addCircle} alt='add' />
                                Add Family Members
                            </button>
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

                        <div className='family-members-section'>
                            <h2>Family Members</h2>
                            <div className='family-members-table-root'>
                                <table className='family-members-table'>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Sex</th>
                                            <th>Age</th>
                                            <th>Address</th>
                                            <th>Medical Conditions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {familyMembers.map((member, index) => (
                                            <tr key={index}>
                                                <td>{`${member.firstName} ${member.lastName}`}</td>
                                                <td>{member.sex}</td>
                                                <td>{member.age}</td>
                                                <td>{member.address}</td>
                                                <td>{member.medical}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                                <table className='family-members-table'>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Sex</th>
                                            <th>Age</th>
                                            <th>Address</th>
                                            <th>Medical Conditions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {familyMembers.map((member, index) => (
                                            <tr key={index}>
                                                <td>{`${member.firstName} ${member.lastName}`}</td>
                                                <td>{member.sex}</td>
                                                <td>{member.age}</td>
                                                <td>{member.address}</td>
                                                <td>{member.medical}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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

function EvacueeRequest({ currentEvac, setActiveMenu }) {
    const [evacuationCenter, setEvacuationCenter] = useState("");
    const [requests, setRequests] = useState([]);
    const [showCreateRequest, setShowCreateRequest] = useState(false);
    const [newRequest, setNewRequest] = useState({
        type: '',
        quantity: '',
        description: ''
    });

    const handleGoToCenters = () => {
        setActiveMenu('evacuation-center');
    };

    const [loading, setLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseType, setResponseType] = useState("");
    const [showResponse, setShowResponse] = useState(false);
    const [exitAnim, setExitAnim] = useState(false);

    const showTimeout = useRef(null);
    const exitTimeout = useRef(null);

    const clearAllTimeouts = () => {
        if (showTimeout.current) clearTimeout(showTimeout.current);
        if (exitTimeout.current) clearTimeout(exitTimeout.current);
    };

    const handleShowCreateRequest = () => setShowCreateRequest(true);
    const handleCloseCreateRequest = () => {
        setShowCreateRequest(false);
        setNewRequest({ type: '', quantity: '', description: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRequest(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        clearAllTimeouts();

        if (!newRequest.type || !newRequest.quantity || !newRequest.description) return;

        const today = new Date().toISOString().split('T')[0];
        const evacueeId = localStorage.getItem("evacueeId");
        const token = localStorage.getItem("evacueeToken");

        if (!evacueeId) {
            setResponseMessage("Evacuee ID not found. Please log in again.");
            setResponseType("error");
            setShowResponse(true);
            return;
        }

        const payload = {
            evacuee_id: evacueeId,
            evacuation_center_id: evacuationCenter,
            request_type: newRequest.type,
            quantity: newRequest.quantity,
            description: newRequest.description,
            date: today,
            status: 'Pending'
        };

        console.log(payload)

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/evacuee-request/`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                 },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to submit request");
            }

            setRequests(prev => [...prev, payload]);
            setResponseMessage("Request submitted successfully!");
            setResponseType("success");
            setShowResponse(true);
            handleCloseCreateRequest();

            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 4000);

        } catch (error) {
            console.error("Submit request error:", error);
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

    // GET EVACUATION CENTER ID from currentEvac
    useEffect(() => {
        if (currentEvac && currentEvac.length > 0) {
            const centerId = currentEvac[0].evacuation_center_id;
            setEvacuationCenter(centerId);
        }
    }, [currentEvac]);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!evacuationCenter) return;
    
            const evacueeId = localStorage.getItem("evacueeId");
            const token = localStorage.getItem("evacueeToken");
    
            if (!evacueeId || !token) return;
    
            try {
                const response = await fetch(
                    `http://localhost:3000/evacuee-request/evacuee/${evacueeId}/center/${evacuationCenter}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                    }
                );
    
                const data = await response.json();
    
                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch requests");
                }
    
                setRequests(data);
            } catch (error) {
                console.error("Error fetching evacuee requests:", error);
            }
        };
    
        fetchRequests();

        const interval = setInterval(() => {
            fetchRequests();
        }, 5000);
    
        return () => clearInterval(interval);
    }, [evacuationCenter]);
    

    return (
        evacuationCenter ? (
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
                <img src={requestActive} alt="icon" />
              </div>
              <div className="page-label-text">
                <p>Request</p>
              </div>
              <button className="request-button" onClick={handleShowCreateRequest}>
                <img src={requestBtn} alt="create" />
                Create Request
              </button>
            </div>
      
            <div className="page-content-request">
              <div className="evacuee-request-table">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", fontStyle: "italic" }}>
                          No requests available
                        </td>
                      </tr>
                    ) : (
                      requests.map((req, index) => (
                        <tr key={index}>
                          <td>{req.request_type}</td>
                          <td>{req.quantity}</td>
                          <td>{req.description}</td>
                          <td>{req.date || new Date(req.createdAt).toLocaleDateString()}</td>
                          <td>{req.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
      
            {showCreateRequest && (
              <div className="request">
                <div className="request-body">
                  <div className="close-container">
                    <button onClick={handleCloseCreateRequest}>
                      <img src={close} alt="close" />
                    </button>
                  </div>
                  <div className="create-request">
                    <h2>Create Request</h2>
                    <form onSubmit={handleSubmitRequest}>
                      <div className="input-fields">
                        <label>Request Type</label>
                        <select
                          name="type"
                          value={newRequest.type}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Option</option>
                          <option value="Food">Food</option>
                          <option value="Water">Water</option>
                          <option value="Clothes">Clothes</option>
                          <option value="Medicine">Medicine</option>
                        </select>
      
                        <label>Quantity</label>
                        <input
                          type="number"
                          name="quantity"
                          placeholder="0"
                          value={newRequest.quantity}
                          onChange={handleInputChange}
                          required
                        />
      
                        <label>Description</label>
                        <textarea
                          name="description"
                          value={newRequest.description}
                          onChange={handleInputChange}
                          required
                        />
      
                        <div className="buttons">
                          <button
                            type="reset"
                            className="reset-btn"
                            onClick={() => setNewRequest({ type: "", quantity: "", description: "" })}
                          >
                            Clear
                          </button>
                          <button type="submit" className="submit-btn">
                            Submit
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="evacuee-error">
            <div className="error-body">
              <div className="error-image">
                <img src={error} alt="error" />
              </div>
              <div className="error-text">
                <h2>Oops!</h2>
                <p>You must be approved to an evacuation center to access this feature.</p>
              </div>
              <div className="buttons">
                <button onClick={handleGoToCenters}>OK</button>
              </div>
            </div>
          </div>
        )
    );
}

function EvacueeAnnouncements({
    currentEvac,
    setActiveMenu
}) {
    const [evacuationCenter, setEvacuationCenter] = useState("");
    const [showAnnouncement, setShowAnnouncement] = useState(false);

    // GET EVACUATION CENTER ID from currentEvac
    useEffect(() => {
        if (currentEvac && currentEvac.length > 0) {
            const centerId = currentEvac[0].evacuation_center_id;
            setEvacuationCenter(centerId);
        }
    }, [currentEvac]);

    const handleGoToCenters = () => {
        setActiveMenu('evacuation-center');
    };

    const handleShowAnnouncement = () => setShowAnnouncement(true);
    const handleCloseAnnouncement = () => setShowAnnouncement(false);

    return(
        evacuationCenter ? (
            <>
                <div className="page-label">
                    <div className="page-icon">
                        <img src={announcementsActive} alt="icon" />
                    </div>
                    <div className="page-label-text">
                        <p>Announcements</p>
                    </div>
                </div>

                <div className='page-content-announcements'>
                    <div className='evacuee-announcements'>
                        <div className='announcement-card'>
                            <div className='announcement-image'>
                            <img src={evacCenter}/>
                            </div>
                            <div className='announcement-text'>
                                <h2>Bulletin Title</h2>
                                <p>Author</p>
                                <p>Date</p>
                                <p>Description</p>
                                <div className='announcement-button'>
                                    <button onClick={handleShowAnnouncement}>View</button>
                                </div>
                            </div>
                        </div>

                        <div className='announcement-card'>
                            <div className='announcement-image'>
                                <img src={evacCenter}/>
                            </div>
                            <div className='announcement-text'>
                                <h2>Bulletin Title</h2>
                                <p>Author</p>
                                <p>Date</p>
                                <p>Description</p>
                                <div className='announcement-button'>
                                    <button onClick={handleShowAnnouncement}>View</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {showAnnouncement && (
                    <div className='announcement-info'>
                        <div className='announcement-info-body'>
                            <div className="close-container" onClick={handleCloseAnnouncement}>
                                <img src={close} alt="close" />
                            </div>
                            <div className='announcement-image'>
                                <img src={evacCenter}/>
                            </div>
                            <div className='announcement-text'>
                                <h2>Bulletin Title</h2>
                                <p>Author</p>
                                <p>Date</p>
                                <br/>
                                <p>Description</p>
                            </div>
                        </div>
                    </div>
                )}
            </>
        ) : (
            <div className="evacuee-error">
            <div className="error-body">
              <div className="error-image">
                <img src={error} alt="error" />
              </div>
              <div className="error-text">
                <h2>Oops!</h2>
                <p>You must be approved to an evacuation center to access this feature.</p>
              </div>
              <div className="buttons">
                <button onClick={handleGoToCenters}>OK</button>
              </div>
            </div>
          </div>
        )
    );
}

function EvacueeNotifications() {
    return(
        <>
            <div className="page-label">
                <div className="page-icon">
                    <img src={notificationsActive} alt="icon" />
                </div>
                <div className="page-label-text">
                    <p>Notifications</p>
                </div>
            </div>

            <div className='page-content-notifications'>
                <div className='notification-buttons'>
                    <button>All</button>
                    <button>Unread</button>
                </div>
                <div className='notifications-root'>
                    <div className='notification-card'>
                        <div className='notification-text'>
                            <h2>Notification Title</h2>
                            <p>Notification Body</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function EvacueeSettings() {
    return(
        <>
            <div className="page-label">
                <div className="page-icon">
                    <img src={settingsActive} alt="icon" />
                </div>
                <div className="page-label-text">
                    <p>Settings</p>
                </div>
            </div>
        </>
    )
}

export default Evacuee