import '../../css/evacuation-center.css'
import { useState, useEffect, useRef } from 'react'
import { jsPDF } from 'jspdf';
import "jspdf-autotable";
import Select from "react-select"

import evacuationCenterActive from '../../assets/evacuation-center-active.png'
import close from '../../assets/close.png'
import check from '../../assets/check.png'
import error from '../../assets/error.png'

function ManageEvacuees() {
    const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
    const [showAssignArea, setShowAssignArea] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedEvacuee, setSelectedEvacuee] = useState(null);
    const [activeFilter, setActiveFilter] = useState("all");
    const [evacuees, setEvacuees] = useState([]);
    const [areas, setAreas] = useState([]);
    const [selectedArea, setSelectedArea] = useState(null);
    const [evacueeId, setEvacueeId] = useState("");
    const [loading, setLoading] = useState(false);

    const [showResponse, setShowResponse] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseType, setResponseType] = useState("");
    const [exitAnim, setExitAnim] = useState(false);

    const FILTERS = {
        ALL: 'all',
        ACTIVE: 'active',
        ASSIGNED: 'assigned',
        RETURNED: 'returned',
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

    const evacuationCenterId = localStorage.getItem("evacuationCenterId"); 
    const token = localStorage.getItem("evacuationCenterToken");

    // Fetch evacuees
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
                        const evacuee = occ.evacuee;
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
                            idPicture: evacuee.id_picture ? `http://localhost:3000/${evacuee.id_picture}` : "https://via.placeholder.com/120",
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

    // Fetch areas for assignment
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
            // Format areas for React Select
            const formattedAreas = data.map(area => ({
                value: area._id,
                label: `${area.area_name} (${area.available_space} available of ${area.capacity})`,
                areaData: area
            }));
            setAreas(formattedAreas);
        } catch (error) {
            console.error("Error fetching areas:", error);
        }
    };

    const dismissEvacuee = async () => {
        try {
            clearAllTimeouts();

            const payload = {
                status: "Returned"
            }

            const res = await fetch(`http://localhost:3000/evacuation-center-occupant/status/${evacueeId}`, {
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
                    e.id === evacueeId ? { ...e, status: "Returned" } : e
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
                    setEvacueeId("");
                }, 400);
            }, 3000);

            handleCloseShowConfirmation();
        } catch (error) {
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
            const res = await fetch(`http://localhost:3000/center-area/add-occupant/${selectedArea.value}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    evacuee_id: selectedEvacuee.evacuee_id,
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

    const handleShowConfirmation = (id) => {
        setEvacueeId(id);
        setShowConfirmation(true);
    }
    const handleCloseShowConfirmation = () => setShowConfirmation(false);

    const filteredEvacuees = evacuees.filter(evacuee => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'active') return evacuee.status === 'Active';
        if (activeFilter === 'assigned') return evacuee.status === 'Assigned';
        if (activeFilter === 'returned') return evacuee.status === 'Returned';
        if (activeFilter === 'pickup') return evacuee.status === 'For Pick-up';
        return true;
    });

    const generateEvacueeListReport = () => {
        if (evacuees.length === 0) {
            setResponseMessage("No evacuees to generate report.");
            setResponseType("error");
            setShowResponse(true);
            return;
        }
    
        const doc = new jsPDF();
    
        doc.setFontSize(18);
        doc.text("EvacuDesk: Evacuees List", 14, 22);
    
        doc.setFontSize(12);
        doc.text(`Evacuation Center ID: ${evacuationCenterId}`, 14, 30);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);
    
        doc.setLineWidth(0.5);
        doc.line(14, 40, 196, 40);
    
        const tableColumn = ["No.", "Name", "Sex", "Age", "Family", "Status", "Assigned Area", "Approval Date"];
        
        const tableRows = evacuees.map((evacuee, index) => [
            index + 1,
            evacuee.name,
            evacuee.sex,
            evacuee.age,
            evacuee.familyMembers,
            evacuee.status,
            evacuee.assigned_area || "N/A",
            evacuee.approvalDate
        ]);
    
        if (doc.autoTable) {
            doc.autoTable({
                startY: 45,
                head: [tableColumn],
                body: tableRows,
                theme: "grid",
                headStyles: { fillColor: [69, 173, 127] },
                styles: { fontSize: 10 }
            });
        } else {
            let y = 45;
            doc.setFontSize(10);
            doc.text(tableColumn.join(" | "), 14, y);
            y += 6;
            tableRows.forEach(row => {
                doc.text(row.join(" | "), 14, y);
                y += 6;
            });
        }
    
        doc.save(`Evacuees_List_${new Date().toISOString().split("T")[0]}.pdf`);
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
                <button className="create-report-button" onClick={generateEvacueeListReport}>
                    Generate List
                </button>
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
                                    <td>
                                        {evacuee.assigned_area && evacuee.status !== "Returned" ? (
                                            <div className="status-field-assigned">
                                            <span>ASSIGNED</span>
                                            </div>
                                        ) : evacuee.status?.trim().toLowerCase() === "active" ? (
                                            <div className="status-field-active">
                                            <span>ACTIVE</span>
                                            </div>
                                        ) : evacuee.status?.trim().toLowerCase() === "returned" ? (
                                            <div className="status-field-returned">
                                            <span>RETURNED</span>
                                            </div>
                                        ) : (
                                            <span>{evacuee.status || "Unavailable"}</span>
                                        )}
                                    </td>
                                    <td className='actions-cell'>
                                        <button 
                                            className={
                                                evacuee.status === "Returned" || evacuee.assigned_area
                                                    ? "disabled-button" 
                                                    : "mark-picked-button"
                                            } 
                                            disabled={evacuee.status === "Returned" || evacuee.assigned_area}
                                            onClick={() => handleShowAssignArea(evacuee)}
                                        >
                                            {evacuee.assigned_area ? "Assigned" : "Assign"}
                                        </button>

                                        <button className={
                                            evacuee.status === "Returned"
                                                ? "disabled-button" 
                                                : "dismiss-button"
                                        } 
                                        onClick={() => handleShowConfirmation(evacuee.id)}
                                        disabled={evacuee.status === "Returned"}
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
                    <div className='additional-details-body-evacuees'>
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
                            <p><strong>Assigned Area:</strong> {selectedEvacuee.assigned_area ? "Yes" : "No"}</p>
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
                            <h2>Assign Area</h2>
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

                        </div>

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
                                {loading ? "Assigning..." : "Assign"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmation && (
                <div className="confirm-logout">
                    <div className="confirm-logout-body">
                        <div className="error-text">
                            <h2>Confirm Dismiss</h2>
                            <p>Are you sure you want to dismiss this evacuee?</p>
                        </div>
                        <div className="buttons">
                            <button className='yes-button' onClick={dismissEvacuee}>Yes</button>
                            <button className='cancel-button' onClick={handleCloseShowConfirmation}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ManageEvacuees