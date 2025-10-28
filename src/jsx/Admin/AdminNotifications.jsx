import { useEffect, useState, useRef } from 'react';

import notificationsActive from '../../assets/notification-active.png'

function AdminNotifications() {
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
                <div className='notification-buttons'>
                    <button>All</button>
                    <button>Unread</button>
                </div>
                <div className='notifications-root'>
                    <div className='notification-card'>
                        <div className='notification-text'>
                            <h2>Notification Title</h2>
                            <p>Notification Body</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminNotifications