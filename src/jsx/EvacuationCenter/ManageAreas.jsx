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

    // const [areas, setAreas] = useState([]);

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

    // AREAS PLACEHOLDER
    const areas = [
        {   
            "id": 1,
            "area_number": 1,
            "date": "10/26/2025",
            "evacuee": {
                "name": "John Doe",
                "sex": "Male",
                "address": "123 Apple St."
            },
            "number_of_family_members": 4,
            "status": "Occupied"
        },
        {   
            "id": 2,
            "area_number": 2,
            "date": "10/26/2025",
            "evacuee": {
                "name": "N/A",
                "sex": "N/A",
                "address": "N/A"
            },
            "number_of_family_members": 0,
            "status": "Unoccupied"
        },
    ]
    
    // for fetching areas
    useEffect(() => {

    })

    const createArea = async () => {
        clearAllTimeouts()
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3000/center-area/", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create area");
            }
            
            setResponseMessage("Area created successfully!");
            setResponseType("success");
            setShowResponse(true);

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
            setLoading(false)
        }
    }

    // SHOW AREA DETAILS
    const handleShowDetails = (area) => {
        setSelectedArea(area);
        setShowDetails(true);
    };

    const handleCloseDetails = () => setShowDetails(false);

    // SHOW CREATE AREA
    const handleShowCreateArea = () => setShowCreateArea(true);
    const handleCloseCreateArea = () => setShowCreateArea(false);

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
                <button className="create-area-button"  onClick={createArea} >
                    <img src={requestBtn} alt="create" />
                    Create Area
                </button>
            </div>

            <div className='page-content-manage-areas'>
                <div className='areas-table'>
                    <table>
                        <thead>
                            <tr>
                                <th>Area No.</th>
                                <th>Date</th>
                                <th>Assigned To</th>
                                <th>Sex</th>
                                <th>Slots</th>                           
                                <th>Status</th> 
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {areas.map((area, index) => (
                                <tr key={area.id}>
                                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                    <td>{area.date}</td>
                                    <td>{area.evacuee.name}</td>
                                    <td>{area.evacuee.sex}</td>
                                    <td>{area.number_of_family_members}</td>
                                    <td>{area.status}</td>
                                    {area.status == "Occupied" ? (
                                        <td className='actions-cell'><button className='details-button' onClick={() => handleShowDetails(area)}>Details</button></td>
                                    ) : (
                                        <td className='actions-cell'><button className='details-button' disabled>Details</button></td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showDetails && selectedArea && (
                <div className="additional-details">
                <div className="additional-details-body">
                    <div className="close-container" onClick={handleCloseDetails}>
                    <img src={close} alt="close" />
                    </div>
                    <div className="details">
                        <h2>Area No. {selectedArea.area_number}</h2>
                        <p><strong>Date:</strong> {selectedArea.date}</p>
                        <p><strong>Assigned to:</strong> {selectedArea.evacuee.name}</p>
                        <p><strong>Sex:</strong> {selectedArea.evacuee.sex}</p>
                        <p><strong>Age:</strong> {selectedArea.evacuee.age}</p>
                        <p><strong>Phone Number:</strong> {selectedArea.evacuee.phone_number}</p>
                        <p><strong>Address:</strong> {selectedArea.evacuee.address}</p>
                        <p><strong>Slots:</strong> {selectedArea.number_of_family_members}</p>
                    </div>
                </div>
                </div>
            )}

            {/*showCreateArea && (
                <div className='create-area'>
                    <div className='create-area-body'>
                        <div className="close-container">
                            <button onClick={handleCloseCreateArea}>
                                <img src={close} alt="close" />
                            </button>
                        </div>

                        <div className='details'>
                            <h2>Create Area</h2>
                            <label>Slots</label>
                            <div className='buttons-row'>
                                <button>-</button>
                                <h2>0</h2>
                                <button>+</button>
                            </div>

                            <div className="buttons">
                                <button
                                    type="reset"
                                    className="clear-button"
                                >
                                    Clear
                                </button>
                                <button type="submit" className="submit-button">
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )*/}
        </>
    )
}

export default ManageAreas