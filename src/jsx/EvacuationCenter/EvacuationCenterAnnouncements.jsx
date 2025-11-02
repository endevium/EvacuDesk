import { useEffect, useState, useRef } from 'react';

import announcementsActive from '../../assets/announcements-active.png'
import evacCenter from '../../assets/evac-center-placeholder.png'
import close from '../../assets/close.png'
import check from '../../assets/check.png'
import error from '../../assets/error.png'
import requestBtn from '../../assets/request-button.png'

function EvacuationCenterAnnouncements() {
    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const [bulletins, setBulletins] = useState([]);
    const [selectedBulletin, setSelectedBulletin] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
    const id = localStorage.getItem("evacuationCenterId");
    const evacuationCenterName = localStorage.getItem("centerName");
    const token = localStorage.getItem("evacuationCenterToken");

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(evacCenter);

    const [showResponse, setShowResponse] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseType, setResponseType] = useState("");
    const [exitAnim, setExitAnim] = useState(false);

    const showTimeout = useRef(null);
    const exitTimeout = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;                
        setImage(file);                  
        const objectUrl = URL.createObjectURL(file);
        setPreviewImage(objectUrl); 
    };
    
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !body || !image) {
            alert("Please fill in all fields.");
            return;
        }
        await createAnnouncement(title, body, image);
    };

    const createAnnouncement = async (title, body, image) => {
        clearAllTimeouts();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", title || "");
            formData.append("body", body || "");
            formData.append("evacuation_center_name", evacuationCenterName || "");

            if (image) {
                formData.append("image", image); 
            }

            const response = await fetch("http://localhost:3000/bulletin/", {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Announcement creation failed");
            }

            setResponseMessage("Announcement created successfully!");
            setResponseType("success");
            setShowResponse(true);

            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 4000);

            handleCloseCreateAnnouncement();
        } catch (error) {
            setResponseMessage(error.message);
            setResponseType("error");
            setShowResponse(true);

            showTimeout.current = setTimeout(() => {
                setExitAnim(true);
                exitTimeout.current = setTimeout(() => {
                    setShowResponse(false);
                    setExitAnim(false);
                }, 400);
            }, 4000);
        } finally {
            setLoading(false);
        }
    }

    const handleShowAnnouncement = (bulletin) => {
        setSelectedBulletin(bulletin);
        setShowAnnouncement(true);
    };

    const handleCloseAnnouncement = () => setShowAnnouncement(false);
    const handleShowCreateAnnouncement = () => setShowCreateAnnouncement(true);
    const handleCloseCreateAnnouncement = () => setShowCreateAnnouncement(false);

    useEffect(() => {
        const fetchBulletins = async () => {
            try {
                const res = await fetch(`http://localhost:3000/bulletin/center-name?center_name=${encodeURIComponent(evacuationCenterName)}`, {
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
            } 
        };
    
        fetchBulletins();
        const interval = setInterval(fetchBulletins, 5000);
        return () => clearInterval(interval);
    }, [evacuationCenterName]);

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
                <button className="create-announcement-button" onClick={handleShowCreateAnnouncement}>
                    <img src={requestBtn} alt="create" />
                    Create Announcement
                </button>
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
                        <p>{bulletin.createdAt
                            ? new Date(bulletin.createdAt).toLocaleString("en-PH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "No date available"}</p>
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

export default EvacuationCenterAnnouncements