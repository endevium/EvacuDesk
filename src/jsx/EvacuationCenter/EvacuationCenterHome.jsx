import { useMemo, useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

import homeActive from '../../assets/home-active.png'
import fulfilled from '../../assets/request_completed.png'
import pending from '../../assets/pending.png'
import denied from '../../assets/denied.png'
import foodPacks from '../../assets/food-packs.png'
import waterPacks from '../../assets/water-packs.png'
import hygienePacks from '../../assets/hygiene-packs.png'
import medicinePacks from '../../assets/medicine-packs.png'
import clothingPacks from '../../assets/clothing-packs.png'
import infantPacks from '../../assets/infant-packs.png'


function EvacuationCenterHome() {
    const [dashboardData, setDashboardData] = useState(null);

    const evacuationCenterId = localStorage.getItem("evacuationCenterId");

    useEffect(() => {
        const fetchDashboard = async () => {
        try {
            const res = await fetch(`http://localhost:3000/dashboard/center/${evacuationCenterId}`);
            const data = await res.json();
            setDashboardData(data);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        }
        };

        fetchDashboard();
        const interval = setInterval(fetchDashboard, 5000);
        return () => clearInterval(interval);
    }, [evacuationCenterId]);


    const requestsPie = useMemo(() => {
        if (!dashboardData) return [];
        return [
        { name: "Approved", value: dashboardData.Approved || 0 },
        { name: "Pending", value: dashboardData.Pending || 0 },
        { name: "Declined", value: dashboardData.Declined || 0 },
        ];
    }, [dashboardData]);

    const centerOccupancy = useMemo(() => {
        if (!dashboardData) return [];
        const occupied = parseFloat(dashboardData.OccupiedSlots) || 0;
        const unoccupied = parseFloat(dashboardData.UnoccupiedSlots) || 0;
        return [
        { name: "Occupied", value: occupied },
        { name: "Available", value: unoccupied },
        ];
    }, [dashboardData]);

    const centerOccupancyColors = ["#45AD7F", "#E0E0E0"];
    const requestColors = ["#45AD7F", "#224539", '#E0E0E0' ];

    // Generate Dashboard Report
    const handleGenerateReport = () => {
        if (!dashboardData) return alert("No data to generate report.");

        const doc = new jsPDF();

        // Report Header
        doc.setFontSize(18);
        doc.text("EvacuDesk: Evacuation Center Dashboard Report", 20, 20);
        doc.setFontSize(12);
        doc.text(`Evacuation Center`, 20, 30);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 37);

        // Divider
        doc.line(20, 40, 190, 40);

        // Dashboard Summary
        doc.setFontSize(14);
        doc.text("Summary", 20, 50);
        doc.setFontSize(12);
        doc.text(`Food Packs: ${dashboardData?.Stocks.FoodPack}`, 20, 60);
        doc.text(`Water Packs: ${dashboardData?.Stocks.WaterPack}`, 20, 67);
        doc.text(`Hygiene Packs: ${dashboardData?.Stocks.HygienePack}`, 20, 74);
        doc.text(`Medicine Packs: ${dashboardData?.Stocks.MedicinePack}`, 20, 81);
        doc.text(`Clothing Packs: ${dashboardData?.Stocks.ClothingPack}`, 20, 88);
        doc.text(`Bedding Packs: ${dashboardData?.Stocks.BeddingPack}`, 20, 95);
        doc.text(`Infant Packs: ${dashboardData?.Stocks.InfantPack}`, 20, 102);
        doc.text(`Approved Requests: ${dashboardData.Approved}`, 20, 109);
        doc.text(`Pending Requests: ${dashboardData.Pending}`, 20, 116);
        doc.text(`Declined Requests: ${dashboardData.Rejected}`, 20, 123);
        doc.text(`Occupied Slots: ${dashboardData.OccupiedSlots}`, 20, 130);
        doc.text(`Available Slots: ${dashboardData.UnoccupiedSlots}`, 20, 137);

        // Footer
        doc.setFontSize(10);
        doc.text("EvacuDesk - Generated Automatically", 20, 280);

        doc.save(`Evacuation_Center_${evacuationCenterId}_Report.pdf`);
    };

    return(
        <>
            <div className='page-label'>
                <div className='page-icon'>
                    <img src={homeActive}/>
                </div>
                <div className='page-label-text'>
                    <p>Home</p>
                </div>
                <button className="create-report-button" onClick={handleGenerateReport}>
                    Generate Report
                </button>
            </div>
            <div className='page-content'>
                <h2>Available Stocks</h2>
                <div className='dashboard-mini-root'>
                    <div className="dashboard-mini-card">
                        <div className="dashboard-mini-icon">
                        <h2>Food Packs</h2>
                        <img src={foodPacks} />
                        </div>
                        <p>{dashboardData?.Stocks?.FoodPack ?? 0}</p>
                    </div>

                    <div className="dashboard-mini-card">
                        <div className="dashboard-mini-icon">
                        <h2>Water Packs</h2>
                        <img src={waterPacks} />
                        </div>
                        <p>{dashboardData?.Stocks?.WaterPack ?? 0}</p>
                    </div>

                    <div className="dashboard-mini-card">
                        <div className="dashboard-mini-icon">
                        <h2>Hygiene Packs</h2>
                        <img src={hygienePacks} />
                        </div>
                        <p>{dashboardData?.Stocks?.HygienePack ?? 0}</p>
                    </div>

                    <div className="dashboard-mini-card">
                        <div className="dashboard-mini-icon">
                        <h2>Medicine Packs</h2>
                        <img src={medicinePacks} />
                        </div>
                        <p>{dashboardData?.Stocks?.MedicinePack ?? 0}</p>
                    </div>

                    <div className="dashboard-mini-card">
                        <div className="dashboard-mini-icon">
                        <h2>Clothing Packs</h2>
                        <img src={clothingPacks} />
                        </div>
                        <p>{dashboardData?.Stocks?.ClothingPack ?? 0}</p>
                    </div>

                    <div className="dashboard-mini-card">
                        <div className="dashboard-mini-icon">
                        <h2>Bedding Packs</h2>
                        <img src={clothingPacks} />
                        </div>
                        <p>{dashboardData?.Stocks?.BeddingPack ?? 0}</p>
                    </div>

                    <div className="dashboard-mini-card">
                        <div className="dashboard-mini-icon">
                        <h2>Infant Packs</h2>
                        <img src={infantPacks} />
                        </div>
                        <p>{dashboardData?.Stocks?.InfantPack ?? 0}</p>
                    </div>
                </div>
                <br />
            
                <div className='charts'>
                    <div className='line-graph'>
                        <h2>Requests Overview</h2>
                        <div className='graph-root'>
                            {requestsPie.length > 0 ? (
                                <ResponsiveContainer width="95%" height="90%">
                                <PieChart>
                                    <Pie data={requestsPie} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                                    {requestsPie.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={requestColors[index % requestColors.length]} />
                                    ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p style={{ textAlign: "center", color: "#888" }}>No data available</p>
                            )}
                        </div>
                    </div>
                    <div className='pie-chart'>
                        <h2>Center Occupancy vs Capacity</h2>
                        <div className='graph-root'>               
                            <ResponsiveContainer width="95%" height="90%">
                                <PieChart>
                                    <Pie
                                    data={centerOccupancy}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    >
                                    {centerOccupancy.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={centerOccupancyColors[index % centerOccupancyColors.length]} />
                                    ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EvacuationCenterHome