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
        let interval;

        const fetchRegistrations = async () => {
            try {
                const centerId = localStorage.getItem("evacuationCenterId");
                const token = localStorage.getItem("evacuationCenterToken");
                if (!centerId) {
                    // console.warn("No evacuation center ID found in localStorage");
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
                    idPicture: "https://via.placeholder.com/120",
                }));

                setEvacuees(mapped);
            } catch (err) {
                console.error("Error fetching registrations:", err);
            }
        };

        fetchRegistrations();

        interval = setInterval(fetchRegistrations, 5000);

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

    const handleApproveEvacuee = async (id) => {
        try {
            const token = localStorage.getItem("evacuationCenterToken");
            const payload = {
                status: "Approved"
            }

            const res = await fetch(`http://localhost:3000/evacuation-registration/${id}`, {
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

    const handleRejectEvacuee = async (id) => {
        try {
            const token = localStorage.getItem("evacuationCenterToken");
            const payload = {
                status: "Rejected"
            }

            const res = await fetch(`http://localhost:3000/evacuation-registration/${id}`, {
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

    const filteredEvacuees = evacuees.filter(evacuee => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'pending') return evacuee.status === 'Pending';
        if (activeFilter === 'declined') return evacuee.status === 'Rejected';
        return true;
    });

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
                    className={activeFilter === 'declined' ? 'active' : ''} 
                    onClick={() => setActiveFilter('declined')}
                >
                    Declined
                </button>
            </div>

            <div className='page-content-manage-registrations'>
                <div className='registrations-table'>
                    <table>
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Registration</th>
                                <th>Name</th>
                                <th>Sex</th>
                                <th>Age</th>
                                <th>Family</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        {filteredEvacuees.length === 0 ? (
                                <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '1rem' }}>
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
                                    <td>{evacuee.sex}</td>
                                    <td>{evacuee.age}</td>
                                    <td>{evacuee.familyMembers}</td>
                                    <td className='actions-cell'>
                                    <button 
                                        className='mark-picked-button' 
                                        onClick={() => {
                                        handleApproveEvacuee(evacuee.id);
                                        }}
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        className='dismiss-button' 
                                        onClick={() => {
                                        handleOpenShowDetails(evacuee);
                                        }}
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
                            <p>
                                <strong>ID Picture:</strong>{' '}
                                <a href={selectedEvacuee.idPicture} target="_blank" rel="noopener noreferrer">
                                    View Picture
                                </a>
                            </p>
                        </div>

                        <div className='evacuee-buttons'>
                            <button className="reject-button">Reject</button>
                            <button className="approve-button">Approve</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ManageRegistrations