import '../../css/admin.css';
import error from '../../assets/error.png'

import AdminSideNav from "./AdminSideNav";
import AdminHeader from "./AdminHeader";
import AdminHome from './AdminHome';
import AdminAnnouncements from './AdminAnnouncements';
import AdminNotifications from './AdminNotifications';
import CreateEvacuationCenter from './CreateEvacuationCenter';
import AdminInventory from './AdminInventory';

import { useState } from 'react';

function Admin() {
    const [activeMenu, setActiveMenu] = useState("home");
    const renderPage = () => {
        switch (activeMenu) {
        case 'home':
            return <AdminHome />;
        case 'create-evac':
            return <CreateEvacuationCenter />;
        case 'manage-inventory':
            return <AdminInventory />;
        case 'announcements':
            return <AdminAnnouncements />;
        case 'notifications':
            return <AdminNotifications />;
        default:
            return <AdminHome />;
        }
    };

    return(
        <>  
            <div className="ec">
                <div className="ec-side">
                    <AdminSideNav activeMenu={activeMenu} setActiveMenu={setActiveMenu}/>
                </div>
                <div className="ec-body-root">
                    <AdminHeader/>
                    <div className="ec-body">
                        {renderPage()}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Admin