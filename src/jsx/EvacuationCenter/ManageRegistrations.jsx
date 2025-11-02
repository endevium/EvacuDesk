import '../../css/evacuation-center.css'
import { useState, useEffect, useRef } from 'react'

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

function ManageRegistrations() {
    const [evacuees, setEvacuees] = useState([]);
    const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
    const [selectedEvacuee, setSelectedEvacuee] = useState(null);
    const [activeFilter, setActiveFilter] = useState("all");

    const [showResponse, setShowResponse] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseType, setResponseType] = useState("");
    const [exitAnim, setExitAnim] = useState(false);

    const FILTERS = {
        ALL: 'all',
        PICKUP: 'pickup',
        PENDING: 'pending',
        REJECTED: 'declined',
    };

    const showTimeout = useRef(null);
    const exitTimeout = useRef(null);

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

    useEffect(() => {
        return () => clearAllTimeouts();
    }, []);

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const centerId = localStorage.getItem("evacuationCenterId");
                const token = localStorage.getItem("evacuationCenterToken");
                if (!centerId) {
                    console.warn("No evacuation center ID found in localStorage");
                    return;
                }

                const res = await fetch(`http://localhost:3000/evacuation-registration/center/awaiting/${centerId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    console.error("Failed to fetch registrations");
                    return;
                }

                const data = await res.json();

                const mapped = data.map((item) => ({
                    id: item._id,
                    registrationDate: new Date(item.createdAt).toLocaleDateString(),
                    name: `${item.evacuee_id.first_name} ${item.evacuee_id.last_name}`,
                    sex: item.evacuee_id.sex || "N/A",
                    age: item.evacuee_id.birthdate
                        ? new Date().getFullYear() - new Date(item.evacuee_id.birthdate).getFullYear()
                        : "N/A",
                    phone: item.evacuee_id.phone_number || "N/A",
                    address: `${item.evacuee_id.street_number}, ${item.evacuee_id.barangay}, ${item.evacuee_id.city}, ${item.evacuee_id.province}`,
                    medical: item.evacuee_id.disabilities || "None",
                    familyMembers: item.number_of_family_members,
                    situation: "-",
                    status: item.status,
                    for_pickup: item.for_pickup,
                    priority_level: item.priority_level,
                    pickup_status: item.pickup_status,
                    idPicture: `http://localhost:3000/${item.evacuee_id.id_picture}`,
                }));

                const sorted = mapped.sort((a, b) => (b.priority_level || 0) - (a.priority_level || 0));

                setEvacuees(sorted);
            } catch (err) {
                console.error("Error fetching registrations:", err);
            }
        };

        fetchRegistrations();
        const interval = setInterval(fetchRegistrations, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleOpenShowDetails = (evacuee) => {
        setSelectedEvacuee(evacuee);
        setShowAdditionalDetails(true);
    };

    const handleCloseShowDetails = () => {
        setShowAdditionalDetails(false);
        setSelectedEvacuee(null);
    };

    const handleApproveEvacuee = async () => {
        try {
            const token = localStorage.getItem("evacuationCenterToken");
            const payload = {
                status: "Approved"
            }

            const res = await fetch(`http://localhost:3000/evacuation-registration/${selectedEvacueeId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(
                    payload
                )
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to approve evacuee");
            }
      
            setResponseMessage("Evacuee approved successfully!");
            setResponseType("success");
            setShowResponse(true);
      
            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 3000);

            handleCloseShowConfirmation();
        } catch (error) {
            setResponseMessage(error.message || "Error approving evacuee");
            setResponseType("error");
            setShowResponse(true);
    
            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 3000);
        }
    }

    const handleRejectEvacuee = async () => {
        try {
            const token = localStorage.getItem("evacuationCenterToken");
            const payload = {
                status: "Rejected"
            }

            const res = await fetch(`http://localhost:3000/evacuation-registration/${selectedEvacueeId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(
                    payload
                )
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to reject evacuee");
            }
      
            setResponseMessage("Evacuee rejected successfully!");
            setResponseType("success");
            setShowResponse(true);
      
            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 3000);

            handleCloseShowRejectConfirmation();
        } catch (error) {
                setResponseMessage(error.message || "Error rejecting evacuee");
                setResponseType("error");
                setShowResponse(true);
      
                showTimeout.current = setTimeout(() => {
                    setExitAnim(true);
                    exitTimeout.current = setTimeout(() => {
                        setShowResponse(false);
                        setExitAnim(false);
                    }, 400);
            }, 3000);
        }
    }

    const handlePickupEvacuee = async () => {
        try {
            const token = localStorage.getItem("evacuationCenterToken");
            const payload = {
                pickup_status: "Picked Up"
            }

            const res = await fetch(`http://localhost:3000/evacuation-registration/pickup-status/${selectedEvacueeId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(
                    payload
                )
            });

            const data = await res.json();
            

            if (!res.ok) {
                throw new Error(data.error || "Failed to pick up evacuee");
            }
            
            setResponseMessage("Evacuee picked up successfully!");
            setResponseType("success");
            setShowResponse(true);
      
            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 3000);

            handleCloseShowPickupConfirmation();
        } catch (error) {
                setResponseMessage(error.message || "Error picking up evacuee");
                setResponseType("error");
                setShowResponse(true);
      
                showTimeout.current = setTimeout(() => {
                    setExitAnim(true);
                    exitTimeout.current = setTimeout(() => {
                        setShowResponse(false);
                        setExitAnim(false);
                    }, 400);
            }, 3000);
        }
    }

    const filteredEvacuees = evacuees.filter(evacuee => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'pickup') return evacuee.for_pickup === 'Yes' && evacuee.pickup_status == 'Awaiting Pickup' && evacuee.status !== 'Rejected';
        if (activeFilter === 'pending') return evacuee.status === 'Pending';
        if (activeFilter === 'declined') return evacuee.status === 'Rejected';
        return true;
    });

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showPickupConfirmation, setShowPickupConfirmation] = useState(false);
    const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);
    const [selectedEvacueeId, setSelectedEvacueeId] = useState(null);

    const handleShowConfirmation = (id) => {
        setSelectedEvacueeId(id);
        setShowConfirmation(true);
    };

    const handleCloseShowConfirmation = () => {
        setShowConfirmation(false);
        setSelectedEvacueeId(null);
    };

    const handleShowPickupConfirmation = (id) => {
        setSelectedEvacueeId(id);
        setShowPickupConfirmation(true);
    };

    const handleCloseShowPickupConfirmation = () => {
        setShowPickupConfirmation(false);
        setSelectedEvacueeId(null);
    };

    const handleShowRejectConfirmation = (id) => {
        setSelectedEvacueeId(id);
        setShowRejectConfirmation(true);
    };

    const handleCloseShowRejectConfirmation = () => {
        setShowRejectConfirmation(false);
        setSelectedEvacueeId(null);
    };

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

            <div className='page-label'>
                <div className='page-icon'>
                    <img src={evacuationCenterActive}/>
                </div>
                <div className='page-label-text'>
                    <p>Manage Registrations</p>
                </div>
            </div>

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

            <div className='page-content-manage-registrations'>
                <div className='registrations-table'>
                    <table>
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Registration</th>
                                <th>Name</th>
                                <th>Priority Level</th>
                                <th>Pickup</th>
                                <th>Age</th>
                                <th>Sex</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        {filteredEvacuees.length === 0 ? (
                                <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '1rem' }}>
                                    No evacuees found.
                                </td>
                                </tr>
                            ) : (
                                filteredEvacuees.map((evacuee, index) => (
                                <tr
                                    key={evacuee.id}
                                    className="summary-row"
                                >
                                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                    <td>{evacuee.registrationDate}</td>
                                    <td>{evacuee.name}</td>
                                    <td>{evacuee.priority_level}</td>
                                    <td>
                                        {evacuee.for_pickup === "Yes" 
                                            ? evacuee.pickup_status === "Awaiting Pickup"
                                            ? "Yes"
                                            : evacuee.pickup_status === "Picked Up"
                                                ? "Picked Up"
                                                : "-"
                                            : "No"
                                        }
                                    </td>
                                    <td>{evacuee.age}</td>
                                    <td>{evacuee.sex}</td>
                                    <td className='actions-cell'>
                                    {evacuee.for_pickup === "Yes" && evacuee.pickup_status === "Awaiting Pickup" ? 
                                        <button 
                                            className={evacuee.status === "Rejected" ? 'disabled-button' : 'pickup-button'}
                                            onClick={() => handleShowPickupConfirmation(evacuee.id)}
                                            disabled={evacuee.status === "Rejected"}
                                        >
                                            Pickup
                                        </button>
                                    : 
                                        <button 
                                            className={evacuee.status === "Rejected" ? 'disabled-button' : 'mark-picked-button'} 
                                            onClick={() => handleShowConfirmation(evacuee.id)}
                                        >
                                            Approve
                                        </button>
                                    }
                                    <button 
                                        className={evacuee.status === "Rejected" ? 'disabled-button' : 'dismiss-button'} 
                                        onClick={() => handleShowRejectConfirmation(evacuee.id)}
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        className='details-button' 
                                        onClick={() => {
                                        handleOpenShowDetails(evacuee);
                                        }}
                                    >
                                        Details
                                    </button>
                                    </td>
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAdditionalDetails && selectedEvacuee && (
                <div className='additional-registrations'>
                    <div className='additional-registrations-body'>
                        <div className="close-container">
                            <button onClick={handleCloseShowDetails}>
                                <img src={close} alt="close" />
                            </button>
                        </div>

                        <div className='details'>
                            <h2>{selectedEvacuee.name}</h2>
                            <p><strong>Sex:</strong> {selectedEvacuee.sex}</p>
                            <p><strong>Age:</strong> {selectedEvacuee.age}</p>
                            <p><strong>Phone Number:</strong> {selectedEvacuee.phone}</p>
                            <p><strong>Address:</strong> {selectedEvacuee.address}</p>
                            <p><strong>Number of Family Members:</strong> {selectedEvacuee.familyMembers}</p>
                            <p><strong>Medical Conditions:</strong> {selectedEvacuee.medical}</p>
                            <p><strong>Status:</strong> {selectedEvacuee.status || "Unavailable"}</p>
                            <p><strong>Priority Level:</strong> {selectedEvacuee.priority_level || "N/A"}</p>
                            <p><strong>For Pickup:</strong> {selectedEvacuee.for_pickup}</p>
                            {selectedEvacuee.assigned_area && (
                                <p><strong>Assigned Area:</strong> {selectedEvacuee.assigned_area}</p>
                            )}
                            <p>
                                <strong>ID Picture:</strong>{' '}
                                <a href={selectedEvacuee.idPicture} target="_blank" rel="noopener noreferrer">
                                    View Picture
                                </a>
                            </p>
                        </div>

                        
                    </div>
                </div>
            )}

            {showConfirmation && (
                <div className="confirm-logout">
                    <div className="confirm-logout-body">
                        <div className="error-text">
                            <h2>Confirm Approve</h2>
                            <p>Are you sure you want to approve this request?</p>
                        </div>
                        <div className="buttons">
                            <button className='yes-button' onClick={() => handleApproveEvacuee()}>Yes</button>
                            <button className='cancel-button' onClick={handleCloseShowConfirmation}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showPickupConfirmation && (
                <div className="confirm-logout">
                    <div className="confirm-logout-body">
                        <div className="error-text">
                            <h2>Confirm Pickup</h2>
                            <p>Are you sure you want to pickup this evacuee?</p>
                        </div>
                        <div className="buttons">
                            <button className='yes-button' onClick={() => handlePickupEvacuee()}>Yes</button>
                            <button className='cancel-button' onClick={handleCloseShowPickupConfirmation}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showRejectConfirmation && (
                <div className="confirm-logout">
                    <div className="confirm-logout-body">
                        <div className="error-text">
                            <h2>Confirm Reject</h2>
                            <p>Are you sure you want to reject this evacuee?</p>
                        </div>
                        <div className="buttons">
                            <button className='yes-button' onClick={() => handleRejectEvacuee()}>Yes</button>
                            <button className='cancel-button' onClick={handleCloseShowRejectConfirmation}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ManageRegistrations