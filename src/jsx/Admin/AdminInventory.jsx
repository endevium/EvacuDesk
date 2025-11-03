import '../../css/evacuation-center.css'
import { useState, useEffect, useRef } from 'react'

import inventoryActive from '../../assets/inventory-active.png'
import close from '../../assets/close.png'
import check from '../../assets/check.png'
import error from '../../assets/error.png'
import requestBtn from '../../assets/request-button.png'
import foodPacks from '../../assets/food-packs.png'
import waterPacks from '../../assets/water-packs.png'
import hygienePacks from '../../assets/hygiene-packs.png'
import medicinePacks from '../../assets/medicine-packs.png'
import clothingPacks from '../../assets/clothing-packs.png'
import infantPacks from '../../assets/infant-packs.png'

function AdminInventory() {
    const [stockRequests, setStockRequests] = useState([]);
    const [adminStocks, setAdminStocks] = useState(null);
    const [evacuationCenterStocks, setEvacuationCenterStocks] = useState([]);
    const [showResponse, setShowResponse] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [showCreateRequest, setShowCreateRequest] = useState(false);
    const [responseType, setResponseType] = useState("");
    const [exitAnim, setExitAnim] = useState(false);
    const token = localStorage.getItem("adminToken");
    const [newStockRequest, setNewStockRequest] = useState({
        action: "restock",
        FoodPack: '',
        WaterPack: '',
        HygienePack: '',
        MedicinePack: '',
        ClothingPack: '',
        BeddingPack: '',
        InfantPack: '',
    });

    const showTimeout = useRef(null);
    const exitTimeout = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
      
        setNewStockRequest((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

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

    const handleShowCreateRequest = () => setShowCreateRequest(true);
    const handleCloseCreateRequest = () => {
        setShowCreateRequest(false);
        setNewStockRequest({
            action: "restock",
            FoodPack: '',
            WaterPack: '',
            HygienePack: '',
            MedicinePack: '',
            ClothingPack: '',
            BeddingPack: '',
            InfantPack: '',
        })
    };

    useEffect(() => {
        const fetchAdminStock = async () => {
        try {
            const res = await fetch(`http://localhost:3000/stock/`);
            const data = await res.json();
            setAdminStocks(data);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        }
        };

        fetchAdminStock();
        const interval = setInterval(fetchAdminStock, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchStockRequests = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3000/stock-request/`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                setStockRequests(
                    Array.isArray(data)
                        ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // 🔹 Sort latest first
                        : []
                );
            } catch (error) {
                console.error("Error fetching distributions:", error);
            }
        };

        fetchStockRequests();
        const interval = setInterval(fetchStockRequests, 5000);
        return () => clearInterval(interval);
    }, [token]);

    useEffect(() => {
        const fetchEvacuationCenterSocks = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3000/stock/all`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();
                setEvacuationCenterStocks(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching distributions:", error);
            }
        };

        fetchEvacuationCenterSocks();
        const interval = setInterval(fetchEvacuationCenterSocks, 5000);
        return () => clearInterval(interval);
    }, [ token]);

    const createRequest = async () => {
        const stocks = {
            FoodPack: Number(newStockRequest.FoodPack),
            WaterPack: Number(newStockRequest.WaterPack),
            HygienePack: Number(newStockRequest.HygienePack),
            MedicinePack: Number(newStockRequest.MedicinePack),
            ClothingPack: Number(newStockRequest.ClothingPack),
            BeddingPack: Number(newStockRequest.BeddingPack),
            InfantPack: Number(newStockRequest.InfantPack),
        };

        const totalStocks = Object.values(stocks).reduce((sum, val) => sum + (isNaN(val) ? 0 : val), 0);
        if (totalStocks <= 0) {
            setResponseMessage("Please enter at least one stock quantity.");
            setResponseType("error");
            setShowResponse(true);

            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 3000);

            return;
        }

        const exceedsLimit = Object.entries(stocks).find(([key, val]) => val > 999999);
        if (exceedsLimit) {
            setResponseMessage(`Quantity cannot exceed 999,999.`);
            setResponseType("error");
            setShowResponse(true);

            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 3000);

            return;
        }

        try {
            const requestPayload = {
                action: "restock",
                ...stocks
            };

            const res = await fetch(`http://localhost:3000/stock/update`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(
                    requestPayload
                )
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to restock");
            }
      
            setResponseMessage("Restocked successfully!");
            setResponseType("success");
            setShowResponse(true);
      
            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 3000);

            handleCloseCreateRequest();
        } catch (error) {
            setResponseMessage(error.message || "Error restocking");
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

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);

    const handleShowConfirmation = (id) => {
        setSelectedRequestId(id);
        setShowConfirmation(true);
    };

    const handleCloseShowConfirmation = () => {
        setShowConfirmation(false);
        setSelectedRequestId(null);
    };

    const handleShowRejectConfirmation = (id) => {
        setSelectedRequestId(id);
        setShowRejectConfirmation(true);
    };

    const handleCloseShowRejectConfirmation = () => {
        setShowRejectConfirmation(false);
        setSelectedRequestId(null);
    };
    
    const approveRequest = async () => {
        try {
            const res = await fetch(`http://localhost:3000/stock-request/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    request_id: selectedRequestId,
                    status: "Approved"
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to send stock");
            }
      
            setResponseMessage("Stock sent successfully!");
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
            setResponseMessage(error.message || "Error sending stock");
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

    const rejectRequest = async () => {
        try {
            const res = await fetch(`http://localhost:3000/stock-request/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    request_id: selectedRequestId,
                    status: "Rejected"
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to reject request");
            }
      
            setResponseMessage("Stock request rejected successfully!");
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
            setResponseMessage(error.message || "Error rejecting stock request");
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
                    <img src={inventoryActive}/>
                </div>
                <div className='page-label-text'>
                    <p>Manage Inventory</p>
                </div>
                <div className='page-buttons'>
                    <button className="create-request-button" onClick={() => handleShowCreateRequest()}>
                        <img src={requestBtn} alt="create" />
                        Add Stock
                    </button>
                </div>
            </div>

            <div className='page-content-manage-requests'>
                <h2>Available Stocks</h2>
                <div className='dashboard-mini-root'>
                    <div className="dashboard-mini-card">
                        <div className="dashboard-mini-icon">
                        <h2>Food Packs</h2>
                        <img src={foodPacks} />
                        </div>
                        <p>{adminStocks?.stocks?.FoodPack ?? 0}</p>
                    </div>

                    <div className="dashboard-mini-card">
                        <div className="dashboard-mini-icon">
                        <h2>Water Packs</h2>
                        <img src={waterPacks} />
                        </div>
                        <p>{adminStocks?.stocks?.WaterPack ?? 0}</p>
                    </div>

                    <div className="dashboard-mini-card">
                        <div className="dashboard-mini-icon">
                        <h2>Hygiene Packs</h2>
                        <img src={hygienePacks} />
                        </div>
                        <p>{adminStocks?.stocks?.HygienePack ?? 0}</p>
                    </div>

                    <div className="dashboard-mini-card">
                        <div className="dashboard-mini-icon">
                        <h2>Medicine Packs</h2>
                        <img src={medicinePacks} />
                        </div>
                        <p>{adminStocks?.stocks?.MedicinePack ?? 0}</p>
                    </div>

                    <div className="dashboard-mini-card">
                        <div className="dashboard-mini-icon">
                        <h2>Clothing Packs</h2>
                        <img src={clothingPacks} />
                        </div>
                        <p>{adminStocks?.stocks?.ClothingPack ?? 0}</p>
                    </div>

                    <div className="dashboard-mini-card">
                        <div className="dashboard-mini-icon">
                        <h2>Bedding Packs</h2>
                        <img src={clothingPacks} />
                        </div>
                        <p>{adminStocks?.stocks?.BeddingPack ?? 0}</p>
                    </div>

                    <div className="dashboard-mini-card">
                        <div className="dashboard-mini-icon">
                        <h2>Infant Packs</h2>
                        <img src={infantPacks} />
                        </div>
                        <p>{adminStocks?.stocks?.InfantPack ?? 0}</p>
                    </div>
                </div>

                <br />
                <h2>Evacuation Centers Inventory</h2>
                <div className='inventory-requests'>
                    <div className='inventory-requests-table'>
                        <table>
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Name</th>
                                    <th>Food</th>
                                    <th>Water</th>
                                    <th>Hygiene</th>
                                    <th>Medicine</th>
                                    <th>Clothing</th>
                                    <th>Bedding</th>
                                    <th>Infant</th>
                                </tr>
                            </thead>
                            <tbody>
                                {evacuationCenterStocks.length === 0 ? (
                                    <tr>
                                    <td colSpan="10" style={{ textAlign: "center", padding: "1rem" }}>
                                        No evacuation centers found.
                                    </td>
                                    </tr>
                                ) : (
                                    evacuationCenterStocks.map((center, index) => (
                                    <tr key={center._id} className="summary-row">
                                        <td style={{ textAlign: "center" }}>{index + 1}</td>
                                        <td>{center?.evacuation_center_id?.name}</td>
                                        <td>{center.stocks?.FoodPack}</td>
                                        <td>{center.stocks?.WaterPack}</td>
                                        <td>{center.stocks?.HygienePack}</td>
                                        <td>{center.stocks?.MedicinePack}</td>
                                        <td>{center.stocks?.ClothingPack}</td>
                                        <td>{center.stocks?.BeddingPack}</td>
                                        <td>{center.stocks?.InfantPack}</td>               
                                    </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <br />
                <h2>Stock Requests</h2>
                <div className='stock-requests'>
                    <div className='stock-requests-table'>
                        <table>
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Name</th>
                                    <th>Food</th>
                                    <th>Water</th>
                                    <th>Hygiene</th>
                                    <th>Medicine</th>
                                    <th>Clothing</th>
                                    <th>Bedding</th>
                                    <th>Infant</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockRequests.length === 0 ? (
                                    <tr>
                                    <td colSpan="10" style={{ textAlign: "center", padding: "1rem" }}>
                                        No requests found.
                                    </td>
                                    </tr>
                                ) : (
                                    stockRequests.map((request, index) => (
                                    <tr key={request._id} className="summary-row">
                                        <td style={{ textAlign: "center" }}>{index + 1}</td>
                                        <td>{request.evacuation_center_id?.name}</td>
                                        <td>{request.stocks?.FoodPack}</td>
                                        <td>{request.stocks?.WaterPack}</td>
                                        <td>{request.stocks?.HygienePack}</td>
                                        <td>{request.stocks?.MedicinePack}</td>
                                        <td>{request.stocks?.ClothingPack}</td>
                                        <td>{request.stocks?.BeddingPack}</td>
                                        <td>{request.stocks?.InfantPack}</td>
                                        <td>
                                            {request.status?.trim().toLowerCase() === "pending" ? (
                                                <div className="status-field-assigned">
                                                <span>PENDING</span>
                                                </div>
                                            ) : request.status?.trim().toLowerCase() === "approved" ? (
                                                <div className="status-field-active">
                                                <span>RECEIVED</span>
                                                </div>
                                            ) : request.status?.trim().toLowerCase() === "rejected" ? (
                                                <div className="status-field-returned">
                                                <span>REJECTED</span>
                                                </div>
                                            ) : (
                                                <span>{request.status || "Unavailable"}</span>
                                            )}
                                        </td>
                                        <td className='actions-cell'>
                                            <button 
                                                className={request.status === "Approved" || request.status === "Rejected" ? "disabled-button" : "mark-picked-button"} 
                                                disabled={request.status === "Approved"}
                                                onClick={() => handleShowConfirmation(request._id)}
                                            >
                                                Approve
                                            </button>

                                            <button 
                                                className={request.status === "Approved" || request.status === "Rejected" ? "disabled-button" : "dismiss-button"} 
                                                disabled={request.status === "Approved"}
                                                onClick={() => handleShowRejectConfirmation(request._id)}
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
            </div>


            {showCreateRequest && (
                <div className="request">
                    <div className="request-body">
                        <div className="close-container">
                        <button onClick={() => handleCloseCreateRequest()}>
                            <img src={close} alt="close" />
                        </button>
                        </div>
                        <div className="create-request">
                            <h2>Add Stocks</h2>
                            <form >
                            <div className="input-fields">
                            <label>Food Pack</label>
                            <input
                                type="number"
                                name="FoodPack"
                                placeholder="0"
                                min="0"
                                max="999999"
                                value={newStockRequest.FoodPack}
                                onChange={handleInputChange}
                                required
                            />
            
                            <label>Water Pack</label>
                            <input
                                type="number"
                                name="WaterPack"
                                placeholder="0"
                                min="0"
                                max="999999"
                                value={newStockRequest.WaterPack}
                                onChange={handleInputChange}
                                required
                            />

                            <label>Hygiene Pack</label>
                            <input
                                type="number"
                                name="HygienePack"
                                placeholder="0"
                                min="0"
                                max="999999"
                                value={newStockRequest.HygienePack}
                                onChange={handleInputChange}
                                required
                            />

                            <label>Medicine Pack</label>
                            <input
                                type="number"
                                name="MedicinePack"
                                placeholder="0"
                                min="0"
                                max="999999"
                                value={newStockRequest.MedicinePack}
                                onChange={handleInputChange}
                                required
                            />

                            <label>Clothing Pack</label>
                            <input
                                type="number"
                                name="ClothingPack"
                                placeholder="0"
                                min="0"
                                max="999999"
                                value={newStockRequest.ClothingPack}
                                onChange={handleInputChange}
                                required
                            />

                            <label>Bedding Pack</label>
                            <input
                                type="number"
                                name="BeddingPack"
                                placeholder="0"
                                min="0"
                                max="999999"
                                value={newStockRequest.BeddingPack}
                                onChange={handleInputChange}
                                required
                            />

                            <label>Infant Pack</label>
                            <input
                                type="number"
                                name="InfantPack"
                                placeholder="0"
                                min="0"
                                max="999999"
                                value={newStockRequest.InfantPack}
                                onChange={handleInputChange}
                                required
                            />
            
                            </div>      
                            </form>
                        </div>

                        <div className="buttons">
                                <button
                                type="reset"
                                className="reset-btn"
                                onClick={() =>
                                    setNewStockRequest({
                                        action: "restock",
                                        FoodPack: '',
                                        WaterPack: '',
                                        HygienePack: '',
                                        MedicinePack: '',
                                        ClothingPack: '',
                                        BeddingPack: '',
                                        InfantPack: '',
                                    })
                                }
                                >
                                Clear
                                </button>
                                <button type="submit" className="submit-btn" onClick={() => createRequest()}>
                                Submit
                                </button>
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
                            <button className='yes-button' onClick={() => approveRequest()}>Yes</button>
                            <button className='cancel-button' onClick={handleCloseShowConfirmation}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showRejectConfirmation && (
                <div className="confirm-logout">
                    <div className="confirm-logout-body">
                        <div className="error-text">
                            <h2>Confirm Reject</h2>
                            <p>Are you sure you want to reject this request?</p>
                        </div>
                        <div className="buttons">
                            <button className='yes-button' onClick={() => rejectRequest()}>Yes</button>
                            <button className='cancel-button' onClick={handleCloseShowRejectConfirmation}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default AdminInventory