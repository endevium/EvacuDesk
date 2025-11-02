import '../../css/App.css';
import { useNavigate } from 'react-router-dom';
import facebookIcon from '../../assets/facebook.png';
import twitterIcon from '../../assets/twitter.png';
import linkedInIcon from '../../assets/linkedin.png';
import footerImage from '../../assets/footer-image.png';

function Footer() {
    const navigate = useNavigate();
    return(
      <>
        <div className="footer">
          <div className="footer-body">
            <div className="footer-body-text">
              <div className="features-and-guide">
                <h2>Features</h2>
                <ul className="features-list">
                  <li>Bulletin Board</li>
                  <li>Evacuee Registration</li>
                  <li>Staff Registration</li>
                  <li>Evacuation Center Management</li>
                  <li>Admin Monitoring & Control</li>
                </ul>
                <h2>Support</h2>
                <ul className="support-list">
                  <li>Discover</li>
                  <li>Engage</li>
                  <li>Give</li>
                  <li>Participate</li>
                  <li>Inspire</li>
                </ul>
              </div>
  
              <div className="guide-and-contact">
                <h2>Guide</h2>
                <ul className="guide-list">
                  <li>Learn</li>
                  <li>Connect</li>
                  <li>Contribute</li>
                  <li>Volunteer</li>
                  <li>Share</li>
                </ul>
              </div>
  
              <div className="footer-image" onClick={() => navigate("/login")}>
                <img src={footerImage} alt="footer-image"/>
              </div>
            </div>
  
            <div className="footer-rights">
              <p>© 2025 EvacuDesk. All rights reserved.</p>
            </div>
          </div>
        </div>
      </>
    )
  }

export default Footer