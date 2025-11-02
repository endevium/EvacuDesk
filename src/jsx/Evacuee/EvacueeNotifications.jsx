import { useEffect, useState, useRef, useMemo } from 'react';
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

function EvacueeNotifications() {
    const [notifications, setNotifications] = useState([]);
    const id = localStorage.getItem("evacueeId");

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch(`http://localhost:3000/notification/evacuee/${id}`, {
                    method: "GET",
                })
                const data = await res.json();

                if (!res.ok) {
                    setNotifications([]);
                    throw new Error(data.error || "Fetching notifications failed");
                }

                setNotifications(Array.isArray(data) ? data : data.notifications || []);
            } catch (error) {
                console.error("Error fetching bulletins:", error);
                setNotifications([]);
            } 
        }

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    })

    return(
        <>
            <div className="page-label">
                <div className="page-icon">
                    <img src={notificationsActive} alt="icon" />
                </div>
                <div className="page-label-text">
                    <p>Notifications</p>
                </div>
            </div>

            <div className='page-content-notifications'>
                <div className='notifications-root'>
                    {notifications.length === 0 ? (
                        <p className='no-current-evac'>No notifications found.</p>
                    ) : (
                        notifications.map(notification => (
                            <div key={notification._id}className='notification-card'>
                                <div className='notification-text'>
                                    <h2>{notification.title}</h2>
                                    <p>{notification.body}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    )
}

export default EvacueeNotifications