import '../../css/admin.css'
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
import beddingPacks from '../../assets/bedding.png'
import infantPacks from '../../assets/infant-packs.png'



function AdminHome() {
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
        try {
            const res = await fetch(`http://localhost:3000/dashboard/admin`);
            const data = await res.json();
            setDashboardData(data);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        }
        };

        fetchDashboard();
        const interval = setInterval(fetchDashboard, 5000);
        return () => clearInterval(interval);
    }, []);

    const requestsPie = useMemo(() => {
        if (!dashboardData) return [];
        return [
        { name: "Approved", value: dashboardData.Approved },
        { name: "Pending", value: dashboardData.Pending },
        { name: "Rejected", value: dashboardData.Rejected },
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

    const handleGenerateReport = () => {
        if (!dashboardData) return alert("No data to generate report.");

        const doc = new jsPDF();

        // Report Header
        doc.setFontSize(18);
        doc.text("EvacuDesk: Admin Dashboard Report", 20, 20);
        doc.setFontSize(12);
        doc.text(`Overall Centers`, 20, 30);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 37);

        doc.line(20, 40, 190, 40);

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
        doc.text(`(Overall) Approved Stock Requests: ${dashboardData.Approved}`, 20, 109);
        doc.text(`(Overall) Pending Stock Requests: ${dashboardData.Pending}`, 20, 116);
        doc.text(`(Overall) Declined Stock Requests: ${dashboardData.Rejected}`, 20, 123);
        doc.text(`(Overall) Occupied Stock Slots: ${dashboardData.OccupiedSlots}`, 20, 130);
        doc.text(`(Overall) Available Stock Slots: ${dashboardData.UnoccupiedSlots}`, 20, 137);

        doc.setFontSize(10);
        doc.text("EvacuDesk - Generated Automatically", 20, 280);

        doc.save(`Evacuation_Report_Admin.pdf`);
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
                <div className='page-buttons'>
                    <button className="create-report-button" onClick={handleGenerateReport}>
                        Generate Report
                    </button>
                </div> 

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
                        <img src={beddingPacks} />
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

                <br/>
                <h2>Overall Stock Request Overview</h2>
                <div className='dashboard-mini-root'>
                <div className="dashboard-mini-card">
                    <div className="dashboard-mini-icon">
                        <h2>Approved</h2>
                        <img src={fulfilled} />
                        </div>
                        <p>{dashboardData?.Approved ?? 0}</p>
                    </div>

                    <div className="dashboard-mini-card">
                        <div className="dashboard-mini-icon">
                        <h2>Pending</h2>
                        <img src={pending} />
                        </div>
                        <p>{dashboardData?.Pending ?? 0}</p>
                    </div>

                    <div className="dashboard-mini-card">
                        <div className="dashboard-mini-icon">
                        <h2>Declined</h2>
                        <img src={denied} />
                        </div>
                        <p>{dashboardData?.Rejected ?? 0}</p>
                    </div>
                </div>
                <br/>
                <div className='charts'>
                    <div className='line-graph'>
                        <h2>Overall Requests Overview</h2>
                        <div className='graph-root'>
                            <ResponsiveContainer width="95%" height="90%">
                                <PieChart>
                                    <Pie
                                    data={requestsPie}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    >
                                    {requestsPie.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={requestColors[index % requestColors.length]} />
                                    ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className='pie-chart'>
                        <h2>Overall Center Occupancy</h2>
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

export default AdminHome