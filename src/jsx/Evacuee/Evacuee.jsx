import '../../css/evacuee.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import EvacueeSideNav from './EvacueeSideNav';
import EvacueeHeader from './EvacueeHeader';
import EvacueeHome from './EvacueeHome';
import EvacuationCenterList from './EvacuationCenterList';
import EvacueeAnnouncements from './EvacueeAnnouncements';
import EvacueeRequest from './EvacueeRequest';
import EvacueeNotifications from './EvacueeNotifications';
import EvacueeSettings from './EvacueeSettings';

function Evacuee() {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState('home'); 
    const [currentEvac, setCurrentEvacuation] = useState(null);
    const [currentCenter, setCurrentCenter] = useState(null);

    //useEffect(() => {
        //const evacueeId = localStorage.getItem("evacueeId");
        //if (!evacueeId) {
            //navigate("/login");
        //}
    //}, [navigate]);

    useEffect(() => {
        const fetchActiveEvacuation = async () => {
            try {
                const evacueeId = localStorage.getItem("evacueeId");
                const token = localStorage.getItem("evacueeToken");
                
                if (!evacueeId) {
                    // console.log("No evacuee ID found");
                    setCurrentEvacuation(null);
                    setCurrentCenter(null);
                    return;
                }

                const response = await fetch(`http://localhost:3000/evacuation-center-occupant/active/evacuee/${evacueeId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    // console.log("Active evacuation data:", data);
                    
                    // Check if we have occupant data with evacuation center
                    if (data?.occupant?.evacuation_center_id) {
                        const occupantData = data.occupant;
                        // console.log("Setting current evacuation:", occupantData);
                        // console.log("Setting current center:", occupantData.evacuation_center_id);
                        
                        setCurrentEvacuation(occupantData);
                        setCurrentCenter(occupantData.evacuation_center_id);
                    } else {
                        // console.log("No active evacuation found in response");
                        setCurrentEvacuation(null);
                        setCurrentCenter(null);
                    }
                } else {
                    // console.log("No active evacuation found or error:", response.status);
                    setCurrentEvacuation(null);
                    setCurrentCenter(null);
                }
            } catch (error) {
                // console.error("Error fetching active evacuation:", error);
                setCurrentEvacuation(null);
                setCurrentCenter(null);
            }
        };

        fetchActiveEvacuation();
        const interval = setInterval(fetchActiveEvacuation, 5000);
        return () => clearInterval(interval);
    }, []);

    const renderPage = () => {
        const pages = {
            'home': <EvacueeHome />,
            'evacuation-center': <EvacuationCenterList 
                currentEvac={currentEvac} 
                currentCenter={currentCenter}  
            />,
            'request': <EvacueeRequest currentEvac={currentEvac} setActiveMenu={setActiveMenu} />,
            'announcements': <EvacueeAnnouncements currentEvac={currentEvac} setActiveMenu={setActiveMenu} />,
            'notifications': <EvacueeNotifications />,
            'settings': <EvacueeSettings />
        };

        return pages[activeMenu] || <EvacueeHome />;
    };

    return (
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
    );
}

export default Evacuee;