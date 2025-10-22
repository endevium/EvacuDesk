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

function EvacuationCenterSettings() {
    return(
        <>
            <div className="page-label">
                <div className="page-icon">
                    <img src={settingsActive} alt="icon" />
                </div>
                <div className="page-label-text">
                    <p>Settings</p>
                </div>
            </div>
        </>
    )
}

export default EvacuationCenterSettings