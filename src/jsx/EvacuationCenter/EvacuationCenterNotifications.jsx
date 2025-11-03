import { useEffect, useState, useRef } from 'react';

import notificationsActive from '../../assets/notification-active.png'

function EvacuationCenterNotifications() {
    const [notifications, setNotifications] = useState([]);
    const id = localStorage.getItem("evacuationCenterId");

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch(`http://localhost:3000/notification/center/${id}`, {
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
                                    <p>{new Date(notification.createdAt).toLocaleString()}</p>
                                    <p> {notification.body}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    )
}

export default EvacuationCenterNotifications