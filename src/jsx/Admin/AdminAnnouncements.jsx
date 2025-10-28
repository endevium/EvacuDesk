import { useEffect, useState, useRef } from 'react';

import announcementsActive from '../../assets/announcements-active.png'
import evacCenter from '../../assets/evac-center-placeholder.png'
import close from '../../assets/close.png'
import check from '../../assets/check.png'
import error from '../../assets/error.png'
import requestBtn from '../../assets/request-button.png'

function AdminAnnouncements() {
    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const [bulletins, setBulletins] = useState([]);
    const [selectedBulletin, setSelectedBulletin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
    const token = localStorage.getItem("adminToken");

    // RESPONSE BODY
    const [showResponse, setShowResponse] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseType, setResponseType] = useState("");
    const [exitAnim, setExitAnim] = useState(false);

    const showTimeout = useRef(null);
    const exitTimeout = useRef(null);

    const clearAllTimeouts = () => {
        if (showTimeout.current) {
        clearTimeout(showTimeout.current);
        showTimeout.current = null;
        }
        if (exitTimeout.current) {
        clearTimeout(exitTimeout.current);
        exitTimeout.current = null;
        }
    };

    // CREATE ANNOUNCEMENT
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(evacCenter);

    const handleShowAnnouncement = (bulletin) => {
        setSelectedBulletin(bulletin);
        setShowAnnouncement(true);
    };
    const handleCloseAnnouncement = () => setShowAnnouncement(false);

    const handleShowCreateAnnouncement = () => setShowCreateAnnouncement(true);
    const handleCloseCreateAnnouncement = () => setShowCreateAnnouncement(false);

    const handleImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;                
        setImage(file);                  
        const objectUrl = URL.createObjectURL(file);
        setPreviewImage(objectUrl); 
    };

    const handleClear = () => {
        setTitle("");
        setBody("");
        setImage(null);
        if (previewImage) {
            URL.revokeObjectURL(previewImage);
            setPreviewImage(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // FETCH BULLETINS
    useEffect(() => {
        const fetchBulletins = async () => {
            setLoading(true);
            try {
                const res = await fetch("http://localhost:3000/bulletin", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
    
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
    }, []);

    useEffect(() => {
        return () => {
            if (previewImage) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    return(
        <>  
            {showResponse && (
                <div
                    className={`response-body ${responseType} ${exitAnim ? "exit" : ""}`}
                    role="status"
                    aria-live="polite"
                >
                    {responseType === "success" ? (
                        <img src={check} alt="success" />
                    ) : (
                        <img src={error} alt="error" />
                    )}
                <p>{responseMessage}</p>
                </div>
            )}

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

            <div className='page-content-announcements'>
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

            {showCreateAnnouncement && (
                <div className='create-announcement'>
                    <div className='create-announcement-body'>
                        <div className="close-container">
                            <button onClick={handleCloseCreateAnnouncement}>
                                <img src={close} alt="close" />
                            </button>
                        </div>

                        <div className='details'>
                            <h2>Create Announcement</h2>
                            <div className='input-fields'>
                                <div className='announcement-image'>
                                    <img src={previewImage}/>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <label>Image</label>
                                    <input 
                                    type='file' 
                                    accept='image/*'
                                    required 
                                    onChange={handleImageChange}
                                    />

                                    <label>News Title</label>
                                    <input 
                                    type='text' 
                                    placeholder='Flash Flood Warning' 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)} 
                                    required 
                                    />

                                    <label>Description</label>
                                    <textarea 
                                    placeholder="Enter details here..."
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    required 
                                    />

                                    <div className='buttons'>
                                    <button type='reset' className='clear-button' onClick={handleClear}>
                                        Clear
                                    </button>
                                    <button type='submit' className='submit-button'>
                                        Submit
                                    </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminAnnouncements