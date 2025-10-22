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

function EvacueeAnnouncements({
    currentEvac,
    setActiveMenu
}) {
    const [evacuationCenter, setEvacuationCenter] = useState("");
    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const [bulletins, setBulletins] = useState([]);
    const [selectedBulletin, setSelectedBulletin] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const storedName = localStorage.getItem("evacuationCenterName");
      if (storedName) {
        setEvacuationCenter(storedName.replace(/"/g, ""));
      } else if (currentEvac && currentEvac.length > 0) {
        const centerId = currentEvac[0].evacuation_center_id;
        setEvacuationCenter(centerId);
      }
    }, [currentEvac]);

    useEffect(() => {
      if (!evacuationCenter) return;
  
      const fetchBulletins = async () => {
        setLoading(true);
        try {
          const res = await fetch(
            `http://localhost:3000/bulletin/center-name?center_name=${encodeURIComponent(
              evacuationCenter
            )}`
          );
  
          if (!res.ok) {
            setBulletins([]);
            console.warn("No bulletins found.");
            return;
          }
  
          const data = await res.json();
          setBulletins(data);
        } catch (error) {
          console.error("Error fetching bulletins:", error);
          setBulletins([]);
        } finally {
          setLoading(false);
        }
      };
  
      fetchBulletins();
    }, [evacuationCenter]);

    const handleGoToCenters = () => {
        setActiveMenu('evacuation-center');
    };

    const handleShowAnnouncement = (bulletin) => {
      setSelectedBulletin(bulletin);
      setShowAnnouncement(true);
    };

    const handleCloseAnnouncement = () => setShowAnnouncement(false);

    return(
        evacuationCenter ? (
            <>  
                {loading && (
                    <div className="loading-overlay" aria-hidden="true">
                        <div className="spinner" />
                    </div>
                )}

                <div className="page-label">
                    <div className="page-icon">
                        <img src={announcementsActive} alt="icon" />
                    </div>
                    <div className="page-label-text">
                        <p>Announcements</p>
                    </div>
                </div>

                <div className="page-content-announcements">
                    {!loading && bulletins.length === 0 ? (
                    <p className='no-current-evac'>No announcements available for this center.</p>
                    ) : (
                    <div className="evacuee-announcements">
                        {bulletins.map((bulletin) => (
                        <div key={bulletin._id} className="announcement-card">
                            <div className="announcement-image">
                            <img
                                src={
                                bulletin.image
                                    ? `http://localhost:3000/${bulletin.image}`
                                    : evacCenter
                                }
                                alt="Announcement"
                            />
                            </div>
                            <div className="announcement-text">
                            <h2>{bulletin.title}</h2>
                            <p>{bulletin.evacuation_center_name || "Unknown Author"}</p>
                            <p>{new Date(bulletin.createdAt).toLocaleString()}</p>
                            <div className="announcement-button">
                                <button onClick={() => handleShowAnnouncement(bulletin)}>
                                View
                                </button>
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    )}
                </div>

                {showAnnouncement && selectedBulletin && (
                    <div className="announcement-info">
                    <div className="announcement-info-body">
                        <div className="close-container" onClick={handleCloseAnnouncement}>
                        <img src={close} alt="close" />
                        </div>
                        <div className="announcement-image">
                        <img
                            src={
                            selectedBulletin.image
                                ? `http://localhost:3000/${selectedBulletin.image}`
                                : evacCenter
                            }
                            alt="Announcement"
                        />
                        </div>
                        <div className="announcement-text">
                        <h2>{selectedBulletin.title}</h2>
                        <p>{selectedBulletin.evacuation_center_name || "Unknown Author"}</p>
                        <p>{new Date(selectedBulletin.createdAt).toLocaleString()}</p>
                        <br />
                        <p>
                            {selectedBulletin.body || "No description available."}
                        </p>
                        </div>
                    </div>
                    </div>
                )}
            </>
        ) : (
            <div className="evacuee-error">
            <div className="error-body">
              <div className="error-image">
                <img src={error} alt="error" />
              </div>
              <div className="error-text">
                <h2>Oops!</h2>
                <p>You must be approved to an evacuation center to access this feature.</p>
              </div>
              <div className="buttons">
                <button onClick={handleGoToCenters}>OK</button>
              </div>
            </div>
          </div>
        )
    );
}

export default EvacueeAnnouncements