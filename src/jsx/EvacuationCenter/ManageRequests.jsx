import '../../css/evacuation-center.css'
import { useState, useEffect, useRef } from 'react'

import requestActive from '../../assets/request-active.png'
import close from '../../assets/close.png'
import check from '../../assets/check.png'
import error from '../../assets/error.png'


function ManageRequests() {
    const [distributions, setDistributions] = useState([]);
    const [showResponse, setShowResponse] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseType, setResponseType] = useState("");
    const [exitAnim, setExitAnim] = useState(false);
    const [showDistribute, setShowDistribute] = useState(false);
    const [evacuees, setEvacuees] = useState([]);
    const evacuationCenterId = localStorage.getItem("evacuationCenterId");
    const token = localStorage.getItem("evacuationCenterToken");
    const [newDistribution, setNewDistribution] = useState({
        evacuee_id: '',
        stocks: {
            FoodPack: '',
            WaterPack: '',
            HygienePack: '',
            MedicinePack: '',
            ClothingPack: '',
            BeddingPack: '',
            InfantPack: '',
        }
    });

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


    const handleShowDistribute = () => setShowDistribute(true);
    const handleCloseDistribute = () => {
        setShowDistribute(false);
        setNewDistribution({
            evacuee_id: '',
            stocks: {
                FoodPack: '',
                WaterPack: '',
                HygienePack: '',
                MedicinePack: '',
                ClothingPack: '',
                BeddingPack: '',
                InfantPack: '',
            },
        })
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
      
        if ([
          "FoodPack", "WaterPack", "HygienePack",
          "MedicinePack", "ClothingPack", "BeddingPack", "InfantPack"
        ].includes(name)) {
          setNewDistribution((prev) => ({
            ...prev,
            stocks: {
              ...prev.stocks,
              [name]: value,
            },
          }));
        } else {
          setNewDistribution((prev) => ({
            ...prev,
            [name]: value,
          }));
        }
    };

    useEffect(() => {
        const fetchDistributions = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3000/distribution-record/center/${evacuationCenterId}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();
                setDistributions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching distributions:", error);
            }
        };

        fetchDistributions();
        const interval = setInterval(fetchDistributions, 5000);
        return () => clearInterval(interval);
    }, [evacuationCenterId, token]);

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
                    const filtered = data.occupants.filter(
                        (occ) => occ.status !== "Returned"
                    );
        
                    const mappedEvacuees = filtered.map((occ) => {
                        const evacuee = occ.evacuee;
                        const fullName = `${evacuee.first_name} ${evacuee.last_name}`;
                    
                        return {
                            id: occ._id,
                            evacuee_id: evacuee._id,
                            name: fullName,
                            priority_level: occ.priority_level,
                        };
                    });

                    const sorted = mappedEvacuees.sort((a, b) => (b.priority_level || 0) - (a.priority_level || 0));
                    setEvacuees(sorted);
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

    const distribute = async () => {
        if (!newDistribution.evacuee_id) {
            setResponseMessage("Please select an evacuee");
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
            const res = await fetch(`http://localhost:3000/distribution-record/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...newDistribution,
                    stocks: Object.fromEntries(
                        Object.entries(newDistribution.stocks).map(([k,v]) => [k, Number(v)])
                    )
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to distribute");
            }
      
            setResponseMessage("Distributed successfully!");
            setResponseType("success");
            setShowResponse(true);
      
            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 3000);

            handleCloseDistribute();
        } catch (error) {
            setResponseMessage(error.message || "Error distributing");
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
                    <p>Manage Distributions</p>
                </div>
                <div className='page-buttons'>
                    <button className="create-distribution-button" onClick={() => handleShowDistribute()}>
                        <img src={requestActive} alt="create" />
                        Distribute
                    </button>
                </div>
            </div>

            <div className='page-content-manage-requests'>
                <h2>Distribution History</h2>
                <div className='requests-table'>
                    <table>
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Date</th>
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
                            {distributions.length === 0 ? (
                                <tr>
                                <td colSpan="10" style={{ textAlign: "center", padding: "1rem" }}>
                                    No distributions found.
                                </td>
                                </tr>
                            ) : (
                                distributions.map((distribution, index) => (
                                <tr key={distribution._id} className="summary-row">
                                    <td style={{ textAlign: "center" }}>{index + 1}</td>
                                    <td>{new Date(distribution.createdAt).toLocaleDateString()}</td>
                                    <td>
                                    {distribution.evacuee_id?.first_name} {distribution.evacuee_id?.last_name}
                                    </td>
                                    <td>{distribution.stocks?.FoodPack}</td>
                                    <td>{distribution.stocks?.WaterPack}</td>
                                    <td>{distribution.stocks?.HygienePack}</td>
                                    <td>{distribution.stocks?.MedicinePack}</td>
                                    <td>{distribution.stocks?.ClothingPack}</td>
                                    <td>{distribution.stocks?.BeddingPack}</td>
                                    <td>{distribution.stocks?.InfantPack}</td>
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showDistribute && (
                <div className="request">
                    <div className="request-body">
                        <div className="close-container">
                        <button onClick={() => handleCloseDistribute()}>
                            <img src={close} alt="close" />
                        </button>
                        </div>
                        <div className="create-request">
                            <h2>Distribute</h2>
                            <form >
                            <div className="input-fields">
                            <label>Evacuee</label>
                            <select
                                name="evacuee_id"
                                value={newDistribution.evacuee_id}
                                onChange={handleInputChange}
                                required
                            >   
                                <option value="">Select Evacuee</option>
                                {evacuees.map((evacuee) => 
                                    <option key={evacuee.id} value={evacuee.evacuee_id}>
                                        {evacuee.name}
                                    </option>
                                )}
                            </select>
            
                            <label>Food Pack</label>
                            <input
                                type="number"
                                name="FoodPack"
                                placeholder="0"
                                min="0"
                                value={newDistribution.stocks.FoodPack}
                                onChange={handleInputChange}
                                required
                            />
            
                            <label>Water Pack</label>
                            <input
                                type="number"
                                name="WaterPack"
                                placeholder="0"
                                min="0"
                                value={newDistribution.stocks.WaterPack}
                                onChange={handleInputChange}
                                required
                            />

                            <label>Hygiene Pack</label>
                            <input
                                type="number"
                                name="HygienePack"
                                placeholder="0"
                                min="0"
                                value={newDistribution.stocks.HygienePack}
                                onChange={handleInputChange}
                                required
                            />

                            <label>Medicine Pack</label>
                            <input
                                type="number"
                                name="MedicinePack"
                                placeholder="0"
                                min="0"
                                value={newDistribution.stocks.MedicinePack}
                                onChange={handleInputChange}
                                required
                            />

                            <label>Clothing Pack</label>
                            <input
                                type="number"
                                name="ClothingPack"
                                placeholder="0"
                                min="0"
                                value={newDistribution.stocks.ClothingPack}
                                onChange={handleInputChange}
                                required
                            />

                            <label>Bedding Pack</label>
                            <input
                                type="number"
                                name="BeddingPack"
                                placeholder="0"
                                min="0"
                                value={newDistribution.stocks.BeddingPack}
                                onChange={handleInputChange}
                                required
                            />

                            <label>Infant Pack</label>
                            <input
                                type="number"
                                name="InfantPack"
                                placeholder="0"
                                min="0"
                                value={newDistribution.stocks.InfantPack}
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
                                    setNewDistribution({
                                        evacuee_id: '',
                                        stocks: {
                                            FoodPack: '',
                                            WaterPack: '',
                                            HygienePack: '',
                                            MedicinePack: '',
                                            ClothingPack: '',
                                            BeddingPack: '',
                                            InfantPack: '',
                                        },
                                    })
                                }
                                >
                                Clear
                                </button>
                                <button type="submit" className="submit-btn" onClick={() => distribute()}>
                                Submit
                                </button>
                            </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ManageRequests