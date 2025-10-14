import '../css/evacuee-header.css'
import profilePlaceholder from '../assets/profile-placeholder.png'
import { useEffect, useState } from 'react'

function EvacueeHeader() {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")

    useEffect(() => {
        const fetchEvacueeData = async () => {
            try {
                const evacueeId = localStorage.getItem("evacueeId");
                if (!evacueeId) {
                    throw new Error("Evacuee ID not found. Please log in again.");
                }

                const response = await fetch(`http://localhost:3000/evacuee/${evacueeId}`);
                const data = await response.json();
                setFirstName(data.first_name);
                setLastName(data.last_name);

            } catch (error) {
                console.error('Error fetching evacuee details:', error);
            }
        };

        fetchEvacueeData();
    })
    return(
        <>
            <div className='evacuee-header'>
                <div className='evacuee-text'>
                    <h2>Evacuee Management</h2>
                </div>
                <div className='profile-header'>
                    <div className='profile-picture'>
                        <img src={profilePlaceholder}/>
                    </div>
                    <div className='profile-text'>
                        <h2>{`${firstName} ${lastName}`}</h2>
                        <p>EVACUEE</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EvacueeHeader