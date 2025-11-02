import '../../css/evacuation-center.css';

import EvacuationCenterSideNav from "./EvacuationCenterSideNav";
import EvacuationCenterHeader from "./EvacuationCenterHeader";
import EvacuationCenterHome from './EvacuationCenterHome';
import ManageEvacuees from './ManageEvacuees';
import ManageRegistrations from './ManageRegistrations';
import ManageRequests from './ManageRequests';
import ManageInventory from './ManageInventory';
import EvacuationCenterAnnouncements from './EvacuationCenterAnnouncements';
import EvacuationCenterNotifications from './EvacuationCenterNotifications';
import EvacuationCenterSettings from './EvacuationCenterSettings';
import ManageAreas from './ManageAreas';
import { useState } from 'react';

function EvacuationCenter() {
    const [activeMenu, setActiveMenu] = useState("home");
    const renderPage = () => {
        switch (activeMenu) {
        case 'home':
            return <EvacuationCenterHome />;
        case 'manage-areas':
            return <ManageAreas />;
        case 'manage-evacuees':
            return <ManageEvacuees />;
        case 'manage-registrations':
            return <ManageRegistrations />
        case 'manage-requests':
            return <ManageRequests />;
        case 'manage-inventory':
            return <ManageInventory />;
        case 'announcements':
            return <EvacuationCenterAnnouncements />;
        case 'notifications':
            return <EvacuationCenterNotifications />;
        case 'settings':
            return <EvacuationCenterSettings />;
        default:
            return <EvacuationCenterHome />;
        }
    };

    return(
        <>  
            <div className="ec">
                <div className="ec-side">
                    <EvacuationCenterSideNav activeMenu={activeMenu} setActiveMenu={setActiveMenu}/>
                </div>
                <div className="ec-body-root">
                    <EvacuationCenterHeader/>
                    <div className="ec-body">
                        {renderPage()}
                    </div>
                </div>
            </div>
        </>
    )
}

export default EvacuationCenter