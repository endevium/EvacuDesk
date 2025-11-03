import '../../css/evacuation-center.css'
import { useState, useEffect, useRef } from 'react'

import requestActive from '../../assets/request-active.png'
import close from '../../assets/close.png'
import check from '../../assets/check.png'
import error from '../../assets/error.png'

function EvacueeRequest() {
    const [distributions, setDistributions] = useState([]);
    const evacueeId = localStorage.getItem("evacueeId");
    const token = localStorage.getItem("evacueeToken");

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
        const fetchDistributions = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3000/distribution-record/evacuee/${evacueeId}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
    
                const data = await response.json();
    
                if (Array.isArray(data)) {
                    const sortedData = [...data].sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    setDistributions(sortedData);
                } else {
                    setDistributions([]);
                }
            } catch (error) {
                console.error("Error fetching distributions:", error);
            }
        };
    
        fetchDistributions();
        const interval = setInterval(fetchDistributions, 5000);
        return () => clearInterval(interval);
    }, [evacueeId, token]);    

    return(
        <>  
            <div className='page-label'>
                <div className='page-icon'>
                    <img src={requestActive}/>
                </div>
                <div className='page-label-text'>
                    <p>Distribution Records</p>
                </div>
            </div>

            <div className='page-content-manage-requests'>
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
                                [...distributions]
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .map((distribution, index) => (
                                    <tr key={distribution._id} className="summary-row">
                                    <td style={{ textAlign: "center" }}>{index + 1}</td>
                                    <td>{new Date(distribution.createdAt).toLocaleDateString()}</td>
                                    <td>{distribution.evacuation_center_id?.name || "N/A"}</td>
                                    <td>{distribution.stocks?.FoodPack ?? 0}</td>
                                    <td>{distribution.stocks?.WaterPack ?? 0}</td>
                                    <td>{distribution.stocks?.HygienePack ?? 0}</td>
                                    <td>{distribution.stocks?.MedicinePack ?? 0}</td>
                                    <td>{distribution.stocks?.ClothingPack ?? 0}</td>
                                    <td>{distribution.stocks?.BeddingPack ?? 0}</td>
                                    <td>{distribution.stocks?.InfantPack ?? 0}</td>
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

export default EvacueeRequest