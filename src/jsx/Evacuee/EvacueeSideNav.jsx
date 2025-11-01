import '../../css/evacuee_side.css'
import evacudesk from '../../assets/evacudesk-white.png'
import homeActive from '../../assets/home-active.png'
import evacuationCenterActive from '../../assets/evacuation-center-active.png'
import requestActive from '../../assets/request-active.png'
import announcementsActive from '../../assets/announcements-active.png'
import notificationsActive from '../../assets/notification-active.png'
import settingsActive from '../../assets/settings-active.png'
import home from '../../assets/home.png'
import evacuationCenter from '../../assets/evacuation-center.png'
import request from '../../assets/request.png'
import announcements from '../../assets/announcements.png'
import notifications from '../../assets/notification.png'
import settings from '../../assets/settings.png'
import logout from '../../assets/logout.png'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function EvacueeSideNav({ activeMenu, setActiveMenu }) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();

    const menuItems = [
        { id: 'home', label: 'Home', activeIcon: home, icon: homeActive },
        { id: 'evacuation-center', label: 'Evacuation Center', activeIcon: evacuationCenter, icon: evacuationCenterActive },
        { id: 'announcements', label: 'Announcements', activeIcon: announcements, icon: announcementsActive },
        { id: 'notifications', label: 'Notifications', activeIcon: notifications, icon: notificationsActive },
        { id: 'settings', label: 'Settings', activeIcon: settings, icon: settingsActive }
    ];

    const handleLogout = () => {
        localStorage.removeItem("evacueeToken");
        localStorage.removeItem("evacueeId");
        navigate("/login");
        setShowConfirmation(false);
    };

    const handleShowConfirmation = () => setShowConfirmation(true);
    const handleCloseShowConfirmation = () => setShowConfirmation(false);

    return (
        <>
            <div className='evac-side-nav'>
                <div className='side-nav-body'>
                    <div className='logo'>
                        <img src={evacudesk} alt="Logo"/>
                    </div>

                    <div className='side-nav-menu'>
                        <p className='menu-text'>Menu</p>
                        <div className='menu-items'>
                            {menuItems.map(item => (
                            <div
                                key={item.id}
                                className={activeMenu === item.id ? 'menu-item-active' : 'menu-item'}
                                onClick={() => setActiveMenu(item.id)}
                            >
                                <img
                                src={activeMenu === item.id ? item.activeIcon : item.icon}
                                alt={item.label}
                                />
                                <p>{item.label}</p>
                            </div>
                            ))}
                        </div>

                        <div className='logout-root' onClick={handleShowConfirmation}>
                            <div className='logout-item'>
                            <img src={logout} alt='logout' />
                            <p>Log Out</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showConfirmation && (
                <div className="confirm-logout">
                    <div className="confirm-logout-body">
                        <div className="error-text">
                            <h2>Confirm Logout</h2>
                            <p>Are you sure you want to log out?</p>
                        </div>
                        <div className="buttons">
                            <button className='yes-button' onClick={handleLogout}>Yes</button>
                            <button className='cancel-button' onClick={handleCloseShowConfirmation}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default EvacueeSideNav