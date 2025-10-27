import '../../css/evacuee-header.css'
import profilePlaceholder from '../../assets/profile-placeholder.png'
import { useEffect, useState } from 'react'

function StaffHeader() {
    const [name, setName] = useState("")

    useEffect(() => {
        const fetchEvacueeData = async () => {
            try {
                const evacuationCenterId = localStorage.getItem("evacuationCenterId");
                const token = localStorage.getItem("evacuationCenterToken");
                if (!evacuationCenterId) {
                    throw new Error("Evacuation Center ID not found. Please log in again.");
                }

                const response = await fetch(`http://localhost:3000/evacuation-center/${evacuationCenterId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                setName(data.name);
                localStorage.setItem("centerName", name);

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
                    <h2>Evacuation Center Management</h2>
                </div>
                <div className='profile-header'>
                    <div className='profile-picture'>
                    </div>
                    <div className='profile-text'>
                        <h2>{name}</h2>
                        <p>EVACUATION CENTER</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default StaffHeader