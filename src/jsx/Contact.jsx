import { useState, useRef, useEffect } from "react";

import Header from './Header'
import Footer from './Footer'
import '../css/contact.css'
import phone from '../assets/phone.png'
import email from '../assets/email.png'
import check from '../assets/check.png'

function Contact() {
    return(
        <>
            <Header/>
                <ContactBody/>
            <Footer/>
        </>
    )
}

function ContactBody() {
    const [loading, setLoading] = useState(false);
    const [showResponse, setShowResponse] = useState(false);
    const [exitAnim, setExitAnim] = useState(false);
  
    const loadingTimeout = useRef(null);
    const showTimeout = useRef(null);
    const exitTimeout = useRef(null);
    const formRef = useRef(null);
  
    const clearAllTimeouts = () => {
      if (loadingTimeout.current) { clearTimeout(loadingTimeout.current); loadingTimeout.current = null; }
      if (showTimeout.current) { clearTimeout(showTimeout.current); showTimeout.current = null; }
      if (exitTimeout.current) { clearTimeout(exitTimeout.current); exitTimeout.current = null; }
    };
  
    useEffect(() => {
      return () => {
        clearAllTimeouts();
      };
    }, []);
  
    const handleSubmit = (e) => {
      e.preventDefault();
  
      clearAllTimeouts();
      setExitAnim(false);
      setShowResponse(false);
  
      setLoading(true);
  
      loadingTimeout.current = setTimeout(() => {
        setLoading(false);
        setShowResponse(true);
  

        formRef.current?.reset();
  

        showTimeout.current = setTimeout(() => {
          setExitAnim(true);

          exitTimeout.current = setTimeout(() => {
            setShowResponse(false);
            setExitAnim(false);
          }, 400); 
        }, 3000);
      }, 1000);
    };
  
    return (
      <>
        <div className="contact">
          {showResponse && (
            <div className={`response-body ${exitAnim ? "exit" : ""}`} role="status" aria-live="polite">
              <img src={check} alt="success" />
              <p>Message sent successfully!</p>
            </div>
          )}
  
          {loading && (
            <div className="loading-overlay" aria-hidden="true">
              <div className="spinner" />
            </div>
          )}
  
          <div className="contact-body">
            <div className="contact-header">
              <h2>Contact Us</h2>
              <p>
                We’re here to listen and support you. Reach out to us anytime. <br />
                Our team is committed to responding with care, understanding, <br />
                and timely assistance to help meet your needs.
              </p>
            </div>
          </div>
  
          <div className="contact-cards">
            <div className="contact-card-root">
              <div className="contact-card">
                <div className="contact-card-image">
                  <img src={phone} alt="phone" />
                </div>
                <div className="contact-card-text">
                  <p>+1 (415) 555-1234</p>
                  <p>+1 (415) 555-1234</p>
                  <p>+1 (415) 555-1234</p>
                </div>
              </div>
  
              <div className="contact-card">
                <div className="contact-card-image">
                  <img src={email} alt="email" />
                </div>
                <div className="contact-card-text">
                  <p>General Inquiries: contact@evacudesk.com</p>
                  <p>+1 (415) 555-1234</p>
                  <p>+1 (415) 555-1234</p>
                </div>
              </div>
            </div>
  
            <div className="contact-form-body">
              <form className="contact-form" ref={formRef} onSubmit={handleSubmit}>
                <h2>Send Us a Message</h2>
  
                <label htmlFor="first-name">First Name</label>
                <input type="text" placeholder="John" id="first-name" required />
  
                <label htmlFor="last-name">Last Name</label>
                <input type="text" placeholder="Doe" id="last-name" required />
  
                <label htmlFor="email">Email</label>
                <input type="email" placeholder="john.doe@example.com" id="email" required />
  
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" placeholder="09123456789" id="phone" required />
  
                <label htmlFor="concern">Concerns</label>
                <textarea id="concern" required/>
  
                <button type="submit" disabled={loading}>Send</button>
              </form>
            </div>
          </div>
        </div>
      </>
    );
}

export default Contact