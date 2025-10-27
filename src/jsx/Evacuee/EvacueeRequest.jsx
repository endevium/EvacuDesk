import { useEffect, useState, useRef, useMemo } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

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
          evacuation_center_id: typeof evacuationCenter === 'object' ? evacuationCenter._id : evacuationCenter,
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

    useEffect(() => {
      if (currentEvac && currentEvac.evacuation_center_id) {
          setEvacuationCenter(currentEvac.evacuation_center_id._id);
      } else if (currentEvac && currentEvac.length > 0) {
          const centerId = currentEvac[0].evacuation_center_id;
          setEvacuationCenter(centerId);
      } else {
          setEvacuationCenter("");
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
                console.log(data);
    
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

export default EvacueeRequest