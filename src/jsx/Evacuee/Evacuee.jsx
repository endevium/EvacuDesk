import '../../css/evacuee.css'
import { useEffect, useState, useRef, useMemo } from 'react';

import EvacueeSideNav from './EvacueeSideNav'
import EvacueeHeader from './EvacueeHeader'
import EvacueeHome from './EvacueeHome'
import EvacuationCenterList from './EvacuationCenterList';
import EvacueeAnnouncements from './EvacueeAnnouncements';
import EvacueeRequest from './EvacueeRequest';
import EvacueeNotifications from './EvacueeNotifications';
import EvacueeSettings from './EvacueeSettings';

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

import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

function Evacuee() {
    const [activeMenu, setActiveMenu] = useState('home'); 
    const [currentEvac, setCurrentEvacuation] = useState(null);
    const [currentCenters, setCurrentCenters] = useState({});

    useEffect(() => {
        const fetchCurrent = async () => {
            try {
                const evacueeId = localStorage.getItem("evacueeId");
                const token = localStorage.getItem("evacueeToken");
                if (!evacueeId) {
                    console.warn("Evacuee ID not found.");
                    setCurrentEvacuation([]);
                    setCurrentCenters({});
                    return;
                }
    
                const res = await fetch(`http://localhost:3000/evacuation-registration/approved/evacuee/${evacueeId}`);
    
                if (!res.ok) {
                    console.warn("No approved registrations found.");
                    setCurrentEvacuation([]);
                    setCurrentCenters({});
                    return;
                }
    
                const data = await res.json();
                if (!data || typeof data !== "object") {
                    setCurrentEvacuation(null);
                    setCurrentCenters({});
                    return;
                }
                
                setCurrentEvacuation(data);
    
                const centerData = {};
                const centerNames = [];

                for (const reg of data) {
                    if (!reg.evacuation_center_id) continue;
    
                    try {
                        const centerRes = await fetch(`http://localhost:3000/evacuation-center/${reg.evacuation_center_id}`);
                        if (!centerRes.ok) continue;
                        const center = await centerRes.json();
                        centerData[reg.evacuation_center_id] = center;

                        if (center.evacuation_center_name) {
                            centerNames.push(center.evacuation_center_name);
                        }
                    } catch (err) {
                        console.warn(`Failed to fetch center ${reg.evacuation_center_id}:`, err);
                        continue;
                    }
                }
    
                setCurrentCenters(centerData);

                if (centerNames.length > 0) {
                    localStorage.setItem("evacuationCenterNames", JSON.stringify(centerNames));
                }
            } catch (error) {
                console.error("Error fetching current center:", error);
                setCurrentEvacuation([]);
                setCurrentCenters({});
            }
        };
        
        fetchCurrent();

        const interval = setInterval(fetchCurrent, 5000);
    
        return () => clearInterval(interval);
    }, []);

    const renderPage = () => {
        switch (activeMenu) {
        case 'home':
            return <EvacueeHome />;
        case 'evacuation-center':
            return <EvacuationCenterList 
                currentEvac={currentEvac} 
                currentCenters={currentCenters}  
            />;
        case 'request':
            return <EvacueeRequest 
                currentEvac={currentEvac}
                setActiveMenu={setActiveMenu}
            />;
        case 'announcements':
            return <EvacueeAnnouncements 
            currentEvac={currentEvac} 
            setActiveMenu={setActiveMenu} />;
        case 'notifications':
            return <EvacueeNotifications />;
        case 'settings':
            return <EvacueeSettings />;
        default:
            return <EvacueeHome />;
        }
    };

    return (
        <>
            <div className='evacuee'>
                <div className='evacuee-side'>
                <EvacueeSideNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
                </div>
                <div className='evacuee-body-root'>
                    <EvacueeHeader />
                    <div className='evacuee-body'>
                        {renderPage()}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Evacuee