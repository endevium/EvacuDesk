import { useEffect, useState, useRef } from 'react';
import announcementsActive from '../../assets/announcements-active.png';
import evacCenter from '../../assets/evac-center-placeholder.png';
import close from '../../assets/close.png';
import error from '../../assets/error.png';

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
      // Use the same logic as EvacueeRequest to get evacuation center ID
      if (currentEvac && currentEvac.evacuation_center_id) {
          setEvacuationCenter(currentEvac.evacuation_center_id._id);
      } else if (currentEvac && currentEvac.length > 0) {
          const centerId = currentEvac[0].evacuation_center_id;
          setEvacuationCenter(centerId);
      } else {
          setEvacuationCenter("");
      }
    }, [currentEvac]);

    useEffect(() => {
      if (!evacuationCenter) return;
  
      const fetchBulletins = async () => {
        setLoading(true);
        try {
          // Use the center ID instead of center name in the API call
          const res = await fetch(`http://localhost:3000/bulletin/center-name?center_name=${evacuationCenter}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
          });
  
          if (!res.ok) {
            setBulletins([]);
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

      const interval = setInterval(fetchBulletins, 30000);
      return () => clearInterval(interval);
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
                                onError={(e) => { e.target.src = evacCenter; }}
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
                        <div className="close-container">
                          <button onClick={handleCloseAnnouncement}>
                            <img src={close} alt="close" />
                          </button>
                        </div>
                        <div className="announcement-image">
                        <img
                            src={
                            selectedBulletin.image
                                ? `http://localhost:3000/${selectedBulletin.image}`
                                : evacCenter
                            }
                            alt="Announcement"
                            onError={(e) => { e.target.src = evacCenter; }}
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

export default EvacueeAnnouncements;