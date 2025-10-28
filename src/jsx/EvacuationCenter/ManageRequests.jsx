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

function ManageRequests() {
    const [activeFilter, setActiveFilter] = useState("all");
    const [requests, setRequests] = useState([]);
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

    const evacuationCenterId = localStorage.getItem("evacuationCenterId");
    const token = localStorage.getItem("evacuationCenterToken");

    const filteredRequests = Array.isArray(requests)
    ? requests.filter(request => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'pending') return request.status === 'Pending';
        if (activeFilter === 'declined') return request.status === 'Declined';
        return true;
        })
    : [];

    useEffect(() => {
        let interval;

        const fetchRequests = async () => {
            try {
                const response = await fetch(`http://localhost:3000/evacuee-request/center/${evacuationCenterId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
        
                const data = await response.json();
                setRequests(data);
            } catch (error) {
                console.error("Error fetching requests:", error);
            }
        };
    
        fetchRequests();

        interval = setInterval(fetchRequests, 5000);

        return () => clearInterval(interval);

    }, [evacuationCenterId, token]);

    const fulfillRequest = async (id) => {
        try {
            const payload = {
                status: "Fulfilled"
            }

            const res = await fetch(`http://localhost:3000/evacuee-request/status/${id}`, {
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
                throw new Error(data.error || "Failed to fulfill request");
            }
      
            setResponseMessage("Request fulfilled successfully!");
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
                setResponseMessage(error.message || "Error fulfilling request");
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

    const rejectRequest = async (id) => {
        try {
            const payload = {
                status: "Rejected"
            }

            const res = await fetch(`http://localhost:3000/evacuee-request/status/${id}`, {
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
                throw new Error(data.error || "Failed to reject request");
            }
      
            setResponseMessage("Request rejected successfully!");
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
                setResponseMessage(error.message || "Error rejecting request");
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
                    <img src={requestActive}/>
                </div>
                <div className='page-label-text'>
                    <p>Manage Requests</p>
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

            <div className='page-content-manage-requests'>
                <div className='requests-table'>
                    <table>
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Date</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Quantity</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.length === 0 ? (
                                <tr>
                                <td colSpan="8" style={{ textAlign: "center", padding: "1rem" }}>
                                    No requests found.
                                </td>
                                </tr>
                            ) : (
                                filteredRequests.map((request, index) => (
                                <tr key={request._id} className="summary-row">
                                    <td style={{ textAlign: "center" }}>{index + 1}</td>
                                    <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                                    <td>
                                    {request.evacuee_id?.first_name} {request.evacuee_id?.last_name}
                                    </td>
                                    <td>{request.request_type}</td>
                                    <td>{request.quantity}</td>
                                    <td>{request.description}</td>
                                    <td>{request.status}</td>
                                    <td className="actions-cell">
                                    <button 
                                        className={
                                            request.status === "Fulfilled" || request.status === "Rejected"
                                                ? "disabled-button" 
                                                : "fulfill-button"
                                        }
                                        onClick={() => fulfillRequest(request._id)}
                                        disabled={request.status === "Fulfilled" || request.status === "Rejected"}
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        className={
                                            request.status === "Fulfilled" || request.status === "Rejected"
                                                ? "disabled-button" 
                                                : "fulfill-button"
                                        }
                                        onClick={() => rejectRequest(request._id)}
                                        disabled={request.status === "Fulfilled" || request.status === "Rejected"}
                                    >
                                        Reject
                                    </button>
                                    </td>
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default ManageRequests