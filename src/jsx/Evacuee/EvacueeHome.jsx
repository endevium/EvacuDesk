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


function EvacueeHome() {
    const [dashboardData, setDashboardData] = useState(null);
    const evacueeId = localStorage.getItem("evacueeId");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
            const res = await fetch(`http://localhost:3000/dashboard/evacuee/${evacueeId}`);
            const data = await res.json();
            setDashboardData(data);
            } catch (err) {
            console.error("Error fetching dashboard data:", err);
            }
        };

        fetchDashboard();
    }, [evacueeId]);

    const lineData = useMemo(() => {
        if (!dashboardData || !dashboardData.RequestsPerWeek) return [];
        return Object.entries(dashboardData.RequestsPerWeek).map(([week, count]) => ({
            week,
            count
        }));
    }, [dashboardData]);

    const pieData = useMemo(() => {
        if (!dashboardData) return [];
        const occupied = parseFloat(dashboardData.OccupiedSlots) || 0;
        const unoccupied = parseFloat(dashboardData.UnoccupiedSlots) || 0;
        return [
          { name: "Occupied", value: occupied },
          { name: "Available", value: unoccupied }
        ];
    }, [dashboardData]);
    
    const pieColors = ['#45AD7F', '#E0E0E0'];

    const handleGenerateReport = () => {
        if (!dashboardData) return alert("No data to generate report.");
        const requestsSummary = Object.entries(dashboardData.RequestsPerWeek || {})
            .map(([week, count]) => `${week}: ${count}`)
            .join(", ");

        const doc = new jsPDF();

        // Report Header
        doc.setFontSize(18);
        doc.text("EvacuDesk: Evacuee Dashboard Report", 20, 20);
        doc.setFontSize(12);
        doc.text(`Evacuee`, 20, 30);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 37);

        // Divider
        doc.line(20, 40, 190, 40);

        // Dashboard Summary
        doc.setFontSize(14);
        doc.text("Summary", 20, 50);
        doc.setFontSize(12);
        doc.text(`Fulfilled Requests: ${dashboardData.Fulfilled}`, 20, 60);
        doc.text(`Pending Requests: ${dashboardData.Pending}`, 20, 67);
        doc.text(`Declined Requests: ${dashboardData.Declined}`, 20, 74);
        doc.text(`Requests per Week: ${requestsSummary}`, 20, 84);
        doc.text(`Occupied Slots: ${dashboardData.OccupiedSlots}`, 20, 94);
        doc.text(`Available Slots: ${dashboardData.UnoccupiedSlots}`, 20, 104);

        // Footer
        doc.setFontSize(10);
        doc.text("EvacuDesk - Generated Automatically", 20, 280);

        doc.save(`Evacuee_${evacueeId}_Report.pdf`);
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
                <button className="request-button" onClick={handleGenerateReport}>
                    Generate Report
                </button>
            </div>
            <div className='page-content'>
                <h2>Requests Overview</h2>
                <div className='dashboard-mini-root'>
                    <div className='dashboard-mini-card'>
                        <div className='dashboard-mini-icon'>
                        <h2>Fulfilled</h2>
                        <img src={fulfilled} />
                        </div>
                        <p>{dashboardData?.Fulfilled ?? 0}</p>
                    </div>

                    <div className='dashboard-mini-card'>
                        <div className='dashboard-mini-icon'>
                        <h2>Pending</h2>
                        <img src={pending} />
                        </div>
                        <p>{dashboardData?.Pending ?? 0}</p>
                    </div>

                    <div className='dashboard-mini-card'>
                        <div className='dashboard-mini-icon'>
                        <h2>Declined</h2>
                        <img src={denied} />
                        </div>
                        <p>{dashboardData?.Declined ?? 0}</p>
                    </div>
                </div>
                <br/>
                <div className='charts'>
                    <div className='line-graph'>
                        <h2>Aid History</h2>
                        <div className='graph-root'>
                            <ResponsiveContainer width="95%" height="90%">
                                <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="week" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="count" stroke="#45AD7F" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className='pie-chart'>
                        <h2>Center Occupancy vs Capacity</h2>
                        <div className='graph-root'>
                            <ResponsiveContainer width="95%" height="90%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
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

export default EvacueeHome