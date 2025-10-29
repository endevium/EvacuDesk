import '../../css/admin.css'
import { useMemo, useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
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
    }, []);

    const requestsPie = useMemo(() => {
        if (!dashboardData) return [];
        return [
        { name: "Fulfilled", value: dashboardData.Fulfilled },
        { name: "Pending", value: dashboardData.Pending },
        { name: "Declined", value: dashboardData.Declined },
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

        // Divider
        doc.line(20, 40, 190, 40);

        // Dashboard Summary
        doc.setFontSize(14);
        doc.text("Summary", 20, 50);
        doc.setFontSize(12);
        doc.text(`(Overall) Fulfilled Requests: ${dashboardData.Fulfilled}`, 20, 60);
        doc.text(`(Overall) Pending Requests: ${dashboardData.Pending}`, 20, 67);
        doc.text(`(Overall) Declined Requests: ${dashboardData.Declined}`, 20, 74);
        doc.text(`(Overall) Occupied Slots: ${dashboardData.OccupiedSlots}`, 20, 84);
        doc.text(`(Overall) Available Slots: ${dashboardData.UnoccupiedSlots}`, 20, 91);

        // Footer
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
                <button className="create-report-button" onClick={handleGenerateReport}>
                    Generate Report
                </button>
            </div>

            <div className='page-content'>
                <h2>Overall Evacuation Center Overview</h2>
                <div className='dashboard-mini-root'>
                <div className="dashboard-mini-card">
                    <div className="dashboard-mini-icon">
                        <h2>Approved</h2>
                        <img src={fulfilled} />
                        </div>
                        <p>{dashboardData?.Fulfilled ?? 0}</p>
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
                        <p>{dashboardData?.Declined ?? 0}</p>
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