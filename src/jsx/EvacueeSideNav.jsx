import '../css/evacuee_side.css'
import evacudesk from '../assets/evacudesk.png'
import homeActive from '../assets/home-active.png'
import evacuationCenterActive from '../assets/evacuation-center-active.png'
import requestActive from '../assets/request-active.png'
import announcementsActive from '../assets/announcements-active.png'
import notificationsActive from '../assets/notification-active.png'
import settingsActive from '../assets/settings-active.png'
import home from '../assets/home.png'
import evacuationCenter from '../assets/evacuation-center.png'
import request from '../assets/request.png'
import announcements from '../assets/announcements.png'
import notifications from '../assets/notification.png'
import settings from '../assets/settings.png'
import logout from '../assets/logout.png'

import { useState } from 'react'

function EvacueeSideNav({ activeMenu, setActiveMenu }) {
    const menuItems = [
        { id: 'home', label: 'Home', activeIcon: homeActive, icon: home },
        { id: 'evacuation-center', label: 'Evacuation Center', activeIcon: evacuationCenterActive, icon: evacuationCenter },
        { id: 'request', label: 'Request', activeIcon: requestActive, icon: request },
        { id: 'announcements', label: 'Announcements', activeIcon: announcementsActive, icon: announcements },
        { id: 'notifications', label: 'Notifications', activeIcon: notificationsActive, icon: notifications },
        { id: 'settings', label: 'Settings', activeIcon: settingsActive, icon: settings },
    ];

    return (
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

            <div className='logout-root'>
                <div className='logout-item'>
                <img src={logout} alt='logout' />
                <p>Log Out</p>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}

export default EvacueeSideNav