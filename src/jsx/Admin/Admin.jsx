import '../../css/admin.css';

import AdminSideNav from "./AdminSideNav";
import AdminHeader from "./AdminHeader";
import AdminHome from './AdminHome';

import { useState } from 'react';

function Admin() {
    const [activeMenu, setActiveMenu] = useState("home");
    const renderPage = () => {
        switch (activeMenu) {
        case 'home':
            return <AdminHome />;
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