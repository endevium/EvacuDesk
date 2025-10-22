import '../../css/evacuee-header.css'
import profilePlaceholder from '../../assets/profile-placeholder.png'


function AdminHeader() {
    return(
        <>
            <div className='evacuee-header'>
                <div className='evacuee-text'>
                    <h2>EvacuDesk Management</h2>
                </div>
                <div className='profile-header'>
                    <div className='profile-picture'>
                        <img src={profilePlaceholder}/>
                    </div>
                    <div className='profile-text'>
                        <h2>Admin</h2>
                        <p>Admin</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminHeader