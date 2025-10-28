import '../../css/evacuation-center.css'
import { useState, useEffect, useRef } from 'react'
import Select from "react-select"

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

function ManageEvacuees() {
    const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
    const [showAssignArea, setShowAssignArea] = useState(false);
    const [selectedEvacuee, setSelectedEvacuee] = useState(null);
    const [activeFilter, setActiveFilter] = useState("all");
    const [evacuees, setEvacuees] = useState([]);
    const [areas, setAreas] = useState([]);
    const [selectedArea, setSelectedArea] = useState(null);
    const [loading, setLoading] = useState(false);

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

    const evacuationCenterId = localStorage.getItem("evacuationCenterId"); 
    const token = localStorage.getItem("evacuationCenterToken");

    // get evacuees
    useEffect(() => {
        const fetchEvacuees = async () => {
            try {
                const res = await fetch(`http://localhost:3000/evacuation-center-occupant/center/${evacuationCenterId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error("Failed to fetch evacuees");
                const data = await res.json();

                if (data && Array.isArray(data.occupants)) {
                    const mappedEvacuees = data.occupants.map((occ) => {
                        const evacuee = occ.evacuee_id; 
                        const fullName = `${evacuee.first_name} ${evacuee.last_name}`;
                        const address = `${evacuee.barangay || "N/A"}, ${evacuee.city || "N/A"}, ${evacuee.province || "N/A"}`;

                        const age = evacuee.birthdate
                            ? Math.floor((new Date() - new Date(evacuee.birthdate)) / (365.25 * 24 * 60 * 60 * 1000))
                            : "N/A";

                        return {
                            id: occ._id,
                            evacuee_id: evacuee._id,
                            name: fullName,
                            approvalDate: new Date(occ.date_joined).toISOString().split("T")[0],
                            status: occ.status || "Active",
                            sex: evacuee.sex || "N/A",
                            age,
                            phone: evacuee.phone_number || "N/A",
                            address,
                            medical: evacuee.disabilities || "None",
                            idPicture: evacuee.id_picture
                                ? `http://localhost:3000/${evacuee.id_picture}`
                                : "https://via.placeholder.com/120",
                            familyMembers: occ.number_of_family_members || 0,
                            assigned_area: occ.assigned_area ? occ.assigned_area.area_number : null
                        };
                    });

                    setEvacuees(mappedEvacuees);
                } else {
                    setEvacuees([]);
                }
            } catch (error) {
                console.error("Error fetching evacuees:", error);
                setEvacuees([]);
            }
        };

        fetchEvacuees();
        const interval = setInterval(fetchEvacuees, 5000);
        return () => clearInterval(interval);
    }, [evacuationCenterId]);

    // get areas for assignment
    const fetchAreas = async () => {
        try {
            const res = await fetch(`http://localhost:3000/center-area/center/${evacuationCenterId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            
            if (!res.ok) {
                throw new Error("Failed to fetch areas");
            }
            
            const data = await res.json();
            const formattedAreas = data.map(area => ({
                value: area._id,
                label: `${area.area_number} (${area.available_space} available of ${area.capacity})`,
                areaData: area
            }));
            setAreas(formattedAreas);
        } catch (error) {
            console.error("Error fetching areas:", error);
        }
    };

    const dismissEvacuee = async (id) => {
        try {
            // setLoading(true);
            clearAllTimeouts();

            const payload = { status: "Left" };

            const res = await fetch(`http://localhost:3000/evacuation-center-occupant/status/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to dismiss evacuee");
            }

            setEvacuees(prev =>
                prev.map(e =>
                    e.id === id ? { ...e, status: "Left" } : e
                )
            );

            setResponseMessage("Evacuee dismissed successfully!");
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
            console.error("Error dismissing evacuee:", error);
            setResponseMessage(error.message || "Error dismissing evacuee");
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

    const assignToArea = async () => {
        if (!selectedEvacuee || !selectedArea) {
            setResponseMessage("Please select an area");
            setResponseType("error");
            setShowResponse(true);
            return;
        }

        setLoading(true);
        clearAllTimeouts();

        try {
            const res = await fetch(`http://localhost:3000/center-area/${selectedArea.value}/add-occupant`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    evacuee_id: selectedEvacuee.evacuee_id,
                    number_of_family_members: selectedEvacuee.familyMembers
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to assign to area");
            }

            setResponseMessage("Evacuee assigned to area successfully!");
            setResponseType("success");
            setShowResponse(true);
            setShowAssignArea(false);
            setSelectedArea(null);

            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 3000);

        } catch (error) {
            setResponseMessage(error.message);
            setResponseType("error");
            setShowResponse(true);

            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenShowDetails = (evacuee) => {
        setSelectedEvacuee(evacuee);
        setShowAdditionalDetails(true);
    };

    const handleCloseShowDetails = () => {
        setShowAdditionalDetails(false);
        setSelectedEvacuee(null);
    };

    const handleShowAssignArea = (evacuee) => {
        setSelectedEvacuee(evacuee);
        fetchAreas();
        setShowAssignArea(true);
    };

    const handleCloseAssignArea = () => {
        setShowAssignArea(false);
        setSelectedArea(null);
        setSelectedEvacuee(null);
    };

    const filteredEvacuees = evacuees.filter(evacuee => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'active') return evacuee.status === 'Active';
        if (activeFilter === 'pickup') return evacuee.status === 'For Pick-up';
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

            {loading && (
                <div className="loading-overlay" aria-hidden="true">
                    <div className="spinner" />
                </div>
            )}

            <div className='page-label'>
                <div className='page-icon'>
                    <img src={evacuationCenterActive}/>
                </div>
                <div className='page-label-text'>
                    <p>Manage Evacuees ({evacuees.filter(e => e.status === 'Active').length})</p>
                </div>
            </div>

            <div className='page-content-manage-evacuees'>
                <div className='evacuees-table'>
                    <table>
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Approval</th>
                                <th>Name</th>
                                <th>Sex</th>
                                <th>Age</th>
                                <th>Family</th>
                                <th>Status</th>
                                <th>Assigned Area</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                    <tbody>
                        {filteredEvacuees.length === 0 ? (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: '1rem' }}>
                                    No evacuees found.
                                </td>
                            </tr>
                        ) : (
                            filteredEvacuees.map((evacuee, index) => (
                                <tr key={evacuee.id}>
                                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                    <td>{evacuee.approvalDate}</td>
                                    <td>{evacuee.name}</td>
                                    <td>{evacuee.sex}</td>
                                    <td>{evacuee.age}</td>
                                    <td>{evacuee.familyMembers}</td>
                                    <td>{evacuee.status}</td>
                                    <td>{evacuee.assigned_area ? "Assigned" : "Not Assigned"}</td>
                                    <td className='actions-cell'>
                                        <button 
                                            className={
                                                evacuee.status === "Left" || evacuee.assigned_area
                                                    ? "disabled-button" 
                                                    : "mark-picked-button"
                                            } 
                                            disabled={evacuee.status === "Left" || evacuee.assigned_area}
                                            onClick={() => handleShowAssignArea(evacuee)}
                                        >
                                            {evacuee.assigned_area ? "Assigned" : "Assign"}
                                        </button>

                                        <button className={
                                            evacuee.status === "Left"
                                                ? "disabled-button" 
                                                : "dismiss-button"
                                        } 
                                        onClick={() => dismissEvacuee(evacuee.id)}
                                        disabled={evacuee.status === "Left"}
                                        >
                                            Dismiss
                                        </button>

                                        <button 
                                            className='details-button' 
                                            onClick={() => handleOpenShowDetails(evacuee)}
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
                <div className='additional-details'>
                    <div className='additional-details-body'>
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
                            <p><strong>Assigned Area:</strong> {selectedEvacuee.assigned_area || "Not Assigned"}</p>
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
            
            {showAssignArea && selectedEvacuee && (
                <div className='assign-area'>
                    <div className='assign-area-body'>
                        <div className="close-container">
                            <button onClick={handleCloseAssignArea}>
                                <img src={close} alt="close" />
                            </button>
                        </div>

                        <div className='details'>
                            <h2>Assign Area to {selectedEvacuee.name}</h2>
                            <p><strong>Family Members:</strong> {selectedEvacuee.familyMembers}</p>
                            
                            <label>Select Area</label>
                            <Select
                                className='select-input'
                                classNamePrefix="select"
                                options={areas}
                                value={selectedArea}
                                onChange={setSelectedArea}
                                placeholder="Choose an area..."
                                isSearchable
                            />

                            {selectedArea && (
                                <div className="area-info">
                                    <p><strong>Selected Area:</strong> {selectedArea.label}</p>
                                    <p><strong>Family Size:</strong> {selectedEvacuee.familyMembers} people</p>
                                </div>
                            )}

                            <div className="buttons">
                                <button
                                    type="button"
                                    className="clear-button"
                                    onClick={handleCloseAssignArea}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="submit-button"
                                    onClick={assignToArea}
                                    disabled={!selectedArea || loading}
                                >
                                    {loading ? "Assigning..." : "Assign to Area"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ManageEvacuees