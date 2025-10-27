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

function EvacuationCenterNotifications() {
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

export default EvacuationCenterNotifications