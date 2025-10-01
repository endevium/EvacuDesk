import { BrowserRouter as Router, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom'
import evacudesk from '../assets/evacudesk.png'
import '../css/App.css'

function Header() {
    const location = useLocation();
    const navigate = useNavigate();
  
    return (
      <div className="header-nav">
        <div className="logo">
          <img src={evacudesk} alt="EvacuDesk Logo" />
        </div>
  
        <ul className="header-list">
          <li>
            <Link
              to="/"
              className={
                location.pathname === "/" ? "home-link-active" : "home-link"
              }
            >
              HOME
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className={
                location.pathname === "/about" ? "about-link-active" : "about-link"
              }
            >
              ABOUT
            </Link>
          </li>
          <li>
            <Link
              to="/news"
              className={
                location.pathname === "/news" ? "news-link-active" : "news-link"
              }
            >
              NEWS
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className={
                location.pathname === "/contact"
                  ? "contact-link-active"
                  : "contact-link"
              }
            >
              CONTACT
            </Link>
          </li>
        </ul>
  
        <ul className="button-list">
          <li>
            <button className="login-button" onClick={() => navigate("/login")}>Login</button>
          </li>
          <li>
            <button className="register-button" onClick={() => navigate("/register")}>Register</button>
          </li>
        </ul>
      </div>
    );
  }

export default Header
