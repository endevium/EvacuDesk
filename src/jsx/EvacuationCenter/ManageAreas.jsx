import '../../css/evacuation-center.css'
import { useState, useEffect, useRef } from 'react';

import areaActive from '../../assets/area-active.png'
import requestBtn from '../../assets/request-button.png'
import check from '../../assets/check.png'
import error from '../../assets/error.png'
import close from '../../assets/close.png'

function ManageAreas() {
    const [showResponse, setShowResponse] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseType, setResponseType] = useState("");
    const [exitAnim, setExitAnim] = useState(false);
    const [selectedArea, setSelectedArea] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showCreateArea, setShowCreateArea] = useState(false);
    const [loading, setLoading] = useState(false);
    const [areas, setAreas] = useState([]);
    const [areaType, setAreaType] = useState("");
    const [areaName, setAreaName] = useState("");
    const [tentSize, setTentSize] = useState("");
    const [capacity, setCapacity] = useState(5);


    // GET EVACUATION CENTER DETAILS
    const evacuationCenterId = localStorage.getItem("evacuationCenterId"); 
    const token = localStorage.getItem("evacuationCenterToken");

    // TIMEOUTS FOR RESPONSE BODY
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
            setAreas(data);
        } catch (error) {
            console.error("Error fetching areas:", error);
            setResponseMessage("Failed to load areas");
            setResponseType("error");
            setShowResponse(true);
        }
    };

    // Fetch areas on component mount
    useEffect(() => {
        fetchAreas();
        const interval = setInterval(fetchAreas, 5000);
        return () => clearInterval(interval);
    }, []);

    const createArea = async () => {
        clearAllTimeouts();
        setLoading(true);
    
        try {
            if (!areaType) throw new Error("Please select an area type.");
    
            const payload = { evacuation_center_id: evacuationCenterId };
    
            if (areaType === "Room") {
                if (!areaName || !capacity) throw new Error("Please enter room name and capacity.");
                payload.area_type = areaType;
                payload.area_name = areaName;
                payload.capacity = capacity;
            } else if (areaType === "Tent") {
                if (!tentSize) throw new Error("Please select a tent size.");
                payload.area_type = areaType;
                payload.size = tentSize;
            } else if (areaType === "Zone") {
                if (!areaName || !capacity) throw new Error("Please select a zone and set capacity.");
                payload.area_type = areaType;
                payload.area_name = areaName;
                payload.capacity = capacity;
            }

            console.log("Sending payload:", payload);
    
            const res = await fetch("http://localhost:3000/center-area/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
    
            const data = await res.json();
    
            if (!res.ok) {
                throw new Error(data.error || "Failed to create area");
            }
    
            setResponseMessage("Area created successfully!");
            setResponseType("success");
            setShowResponse(true);
    
            setCapacity(5);
            setAreaType("");
            setAreaName("");
            setTentSize("");
            setShowCreateArea(false);

            fetchAreas();
    
            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 4000);
    
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
            }, 4000);
        } finally {
            setLoading(false);
        }
    };
    

    const handleShowDetails = (area) => {
        setSelectedArea(area);
        setShowDetails(true);
    };

    const handleCloseDetails = () => setShowDetails(false);
    
    const handleShowCreateArea = () => setShowCreateArea(true);
    const handleCloseCreateArea = () => {
        setShowCreateArea(false);
        setCapacity(5);
    };

    const incrementCapacity = () => setCapacity(prev => prev + 1);
    const decrementCapacity = () => setCapacity(prev => Math.max(1, prev - 1));
    const handleCapacityChange = (e) => setCapacity(Number(e.target.value));

    // Helper function to get total occupants in area
    const getTotalOccupants = (area) => {
        return area.occupants?.reduce((total, occupant) => total + occupant.number_of_family_members, 0) || 0;
    };

    // Helper function to get occupant names
    const getOccupantNames = (area) => {
        if (!area.occupants || area.occupants.length === 0) return "N/A";
        return area.occupants.map(occupant => 
            `${occupant.evacuee_id?.first_name} ${occupant.evacuee_id?.last_name}`
        ).join(", ");
    };

    // Helper function to get total requests in area
    const getTotalRequests = (area) => {
        if (!area.occupants || area.occupants.length === 0) return 0;
        return area.occupants.reduce((total, occupant) => {
            return total + (occupant.request_count || 0);
        }, 0);
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
                    <img src={areaActive}/>
                </div>
                <div className='page-label-text'>
                    <p>Manage Areas</p>
                </div>
                <button className="create-area-button" onClick={handleShowCreateArea}>
                    <img src={requestBtn} alt="create" />
                    Create Area
                </button>
            </div>

            <div className='page-content-manage-areas'>
                <div className='areas-table'>
                    <table>
                        <thead>
                            <tr>
                                <th>Area Type</th>
                                <th>Area Name</th>
                                <th>Occupants</th>
                                <th>Capacity</th>                           
                                <th>Status</th> 
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {areas.map((area) => (
                                <tr key={area._id}>
                                    <td style={{ textAlign: 'center' }}>{area.size ? `${area.size} ${area.area_type}` : area.area_type}</td>
                                    <td style={{ textAlign: 'center' }}>{area.area_name}</td>
                                    <td>{getOccupantNames(area)}</td>
                                    <td style={{ textAlign: 'center', width: '80px' }}>
                                        {getTotalOccupants(area)}/{area.capacity}
                                    </td>
                                    <td>
                                        <div className={area.status === "Unoccupied" ? 'status-field-unoccupied' : 'status-field-occupied'}>
                                            <span className={`status ${area.status?.toLowerCase()}`}>
                                                {area.status ? area.status.toUpperCase() : "AVAILABLE"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className='actions-cell'>
                                        <button 
                                            className='details-button' 
                                            onClick={() => handleShowDetails(area)}
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showDetails && selectedArea && (
                <div className="additional-details">
                    <div className="additional-details-body-areas">
                        <div className="close-container" onClick={handleCloseDetails}>
                            <img src={close} alt="close" />
                        </div>
                        <div className="details">
                            <h2>{selectedArea.area_name}</h2>
                            
                            {/* Area Information */}
                            <div className="detail-section">
                                <h3>Area Information</h3>
                                <p><strong>Capacity:</strong> {selectedArea.capacity || '0'} people</p>
                                <p><strong>Current Occupancy:</strong> {getTotalOccupants(selectedArea)} people</p>
                                <p><strong>Available Space:</strong> {selectedArea.available_space} people</p>
                                <p><strong>Total Requests:</strong> {getTotalRequests(selectedArea)}</p>
                                <p><strong>Status:</strong> 
                                    <span className={`status ${selectedArea.status?.toLowerCase()}`}>
                                        {selectedArea.status}
                                    </span>
                                </p>
                            </div>
                            
                            {/* Occupants List */}
                            <div className="detail-section">
                                <h3>Current Occupants</h3>
                                {selectedArea.occupants && selectedArea.occupants.length > 0 ? (
                                    selectedArea.occupants.map((occupant, index) => (
                                        <div key={occupant._id} className="occupant-item">
                                            <p><strong>Occupant {index + 1}:</strong> {occupant.evacuee_id?.first_name} {occupant.evacuee_id?.last_name}</p>
                                            <p><strong>Family Members:</strong> {occupant.number_of_family_members}</p>
                                            <p><strong>Contact:</strong> {occupant.evacuee_id?.phone_number || "Not provided"}</p>
                                            {occupant.evacuee_id?.medical_conditions && (
                                                <p><strong>Medical Conditions:</strong> {occupant.evacuee_id.medical_conditions}</p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p>No occupants assigned to this area.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCreateArea && (
            <div className="create-area">
                <div className="create-area-body">
                <div className="close-container">
                    <button onClick={handleCloseCreateArea}>
                    <img src={close} alt="close" />
                    </button>
                </div>

                <div className="details">
                    <h2>Create Area</h2>

                    <div className="area-creation">
                    <label htmlFor="areaType">Area Type</label>
                    <select
                        id="areaType"
                        value={areaType}
                        onChange={(e) => setAreaType(e.target.value)}
                        required
                    >
                        <option value="">Select Area Type</option>
                        <option value="Room">Room</option>
                        <option value="Tent">Tent</option>
                        <option value="Zone">Gym / Zone</option>
                    </select>

                    {areaType === "Room" && (
                        <>
                        <label htmlFor="areaName">Room Name</label>
                        <input
                            type="text"
                            id="areaName"
                            value={areaName}
                            onChange={(e) => setAreaName(e.target.value)}
                            placeholder="Enter room name"
                            required
                        />

                        <label>Capacity</label>
                        <div className="buttons-row">
                            <button type="button" onClick={decrementCapacity}>-</button>
                            <input
                            type="number"
                            value={capacity}
                            onChange={handleCapacityChange}
                            min="1"
                            style={{
                                textAlign: "center",
                                fontSize: "1.2rem",
                                border: "none",
                                background: "transparent",
                                width: "60px",
                            }}
                            />
                            <button type="button" onClick={incrementCapacity}>+</button>
                        </div>
                        </>
                    )}

                    {areaType === "Tent" && (
                        <>
                        <label htmlFor="tentSize">Tent Size</label>
                        <select
                            id="tentSize"
                            value={tentSize}
                            onChange={(e) => setTentSize(e.target.value)}
                            required
                        >
                            <option value="">Select Size</option>
                            <option value="Small">Small</option>
                            <option value="Medium">Medium</option>
                            <option value="Large">Large</option>
                        </select>
                        </>
                    )}

                    {areaType === "Zone" && (
                        <>
                        <label htmlFor="zoneArea">Zone Area</label>
                        <select
                            id="zoneArea"
                            value={areaName}
                            onChange={(e) => setAreaName(e.target.value)}
                            required
                        >
                            <option value="">Select Zone</option>
                            <option value="Bleachers">Bleachers</option>
                            <option value="Stage">Stage</option>
                            <option value="Gym Floor">Gym Floor</option>
                        </select>

                        <label>Capacity</label>
                        <div className="buttons-row">
                            <button type="button" onClick={decrementCapacity}>-</button>
                            <input
                            type="number"
                            value={capacity}
                            onChange={handleCapacityChange}
                            min="1"
                            style={{
                                textAlign: "center",
                                fontSize: "1.2rem",
                                border: "none",
                                background: "transparent",
                                width: "60px",
                            }}
                            />
                            <button type="button" onClick={incrementCapacity}>+</button>
                        </div>
                        </>
                    )}
                    </div>

                    <div className="buttons">
                    <button
                        type="button"
                        className="clear-button"
                        onClick={handleCloseCreateArea}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="submit-button"
                        onClick={createArea}
                    >
                        Create
                    </button>
                    </div>
                </div>
                </div>
            </div>
            )}
        </>
    )
}

export default ManageAreas