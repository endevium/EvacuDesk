import React, { useState } from 'react';
import '../../css/evacuee-settings.css';
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
import logout from '../../assets/logout.png'
import backButton from '../../assets/back-button.png';
import userAvatar from '../../assets/profile-placeholder.png';


function EvacueeSettings() {
    const [isContactEditing, setIsContactEditing] = useState(false);
    
    const [formData, setFormData] = useState({
        firstName: 'Juan',
        lastName: 'One',
        email: 'juanone@gmail.com',
        contactNo: '09876543210',
        address: 'Buhay na Tubig Street',
        password: '••••••••'
    });

    const handleContactEdit = () => {
        setIsContactEditing(prev => !prev);
        if (isContactEditing) {
            console.log("Saving changes:", formData);
        }
    };
    
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

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
            
            <div className="account-setting-main-content">
                <div className="setting-header">
                    <h2>Account Setting</h2>
                </div>

                <div className="setting-section">
                    <h3>Personal Info</h3>
                    <p className="section-subtitle">
                        Update your profile, contact details, and preferences to personalize your experience
                    </p>
                    
                    
                    <div className="profile-card">
                        <div className="profile-avatar">
                            <img src={userAvatar} alt="User Avatar" />
                            <div className="profile-details">
                                <h4>{`${formData.firstName} ${formData.lastName}`}</h4>
                                <p>Male</p>
                                <div className="profile-actions">
                                    <button className="upload-btn">Upload new picture</button>
                                    <button className="delete-btn">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-field full-name">
                            <label htmlFor="firstName">Full Name</label>
                            <input
                                type="text"
                                id="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-field last-name">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="divider"></div>

                <div className="setting-section">
                    <h3>Contact email</h3>
                    <button
                                className="edit-save-btn"
                                onClick={handleContactEdit}
                            >
                                {isContactEditing ? 'Save' : 'Edit'}
                            </button>
                    <p className="section-subtitle">
                        Merge your account email address for the invoices.
                    </p>


                    <div className="form-row contact-row">
                        <div className="form-field email-field">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={!isContactEditing}
                            />
                        </div>
                        
                        <div className="form-field contact-no-field">
                            <label htmlFor="contactNo">Contact no.</label>
                            <input
                                type="tel"
                                id="contactNo"
                                value={formData.contactNo}
                                onChange={handleChange}
                                disabled={!isContactEditing}
                            />
                        </div>

                        <div className="form-field address-field">
                            <label htmlFor="address">Address</label>
                            <input
                                type="text"
                                id="address"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={!isContactEditing}
                            />
                        </div>
                    </div>
                </div>

                <div className="divider"></div>
                
                <div className="setting-section">
                    <h3>Password</h3>
                    <button
                                className="edit-save-btn"
                                onClick={handleContactEdit}
                            >
                                {isContactEditing ? 'Save' : 'Edit'}
                            </button>
                    <p className="section-subtitle">
                        Modify your current password.
                    </p>
                    <div className="form-field password-field-wrapper">

                        <input
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={!isContactEditing}
                            className="password-input-dots"
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default EvacueeSettings;