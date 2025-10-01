import { useNavigate } from 'react-router-dom';
import aboutImageOne from '../assets/about-one.png'
import aboutTwoImage from '../assets/about-two-image.png'
import awareness from '../assets/awareness.png'
import accessControl from '../assets/access-control.png'
import socialMedia from '../assets/social-media.png'
import ageLimit from '../assets/age-limit.png'
import handshake from '../assets/handshake.png'
import preparedness from '../assets/preparedness.png'
import organizationalResources from '../assets/organizational-resources.png'
import rumor from '../assets/rumor.png'
import mission from '../assets/mission.png'
import vision from '../assets/vision.png'

import Header from './Header'
import Footer from './Footer'
import '../css/about.css'


function About() {
    return(
        <>
            <Header />
                <AboutOne/>
                <AboutTwo/>
                <AboutThree/>
                <AboutFour/>
                <AboutFive/>
            <Footer />
        </>
    )
}

function AboutOne() {
    return(
        <>
            <div className="about-main-body">
                <div className="body-color">
                    <div className="about-image-one">
                        <img src={aboutImageOne} alt="image-one"/>
                    </div>

                    <div className="about-main-text">
                        <h1>Need Help with
                            EvacuDesk?</h1>

                        <p>Evacudesk provides safety, preparedness, and trust, ensuring communities stay protected, empowered, and resilient during emergencies and unexpected disasters.</p>
                        <button className="discover-more-button">
                            Discover More
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

function AboutTwo() {
    return(
        <>
            <div className="about-two">
                <div className="about-two-body">
                    <div className="about-two-text">
                        <h2>What is EvacuDesk?</h2>
                        <p>EvacuDesk is an emergency preparedness and safety 
                            platform that provides reliable tools, guidance, and 
                            support during disasters and crises. It helps 
                            communities stay informed, prepared, and resilient by 
                            promoting awareness, accessibility, and coordinated 
                            response in times of emergency.</p>

                        <div className="about-two-subtext">
                            <p>Evacudesk is designed to help families, 
                                schools, businesses, and communities 
                                prepare for emergencies effectively. It offers 
                                tools, guidance, and coordination to ensure 
                                safety and resilience during disasters. By 
                                promoting awareness, accessibility, and 
                                cooperation, Evacudesk empowers 
                                individuals and organizations to respond 
                                quickly and confidently when unexpected 
                                crises occur.</p>
                        </div>
                    </div>

                    <div className="about-two-image">
                        <img src={aboutTwoImage}/>
                    </div>
                </div>
            </div>
        </>
    )
}

function AboutThree() {
    return(
        <>
            <div className="about-three">
                <div className="about-three-body">
                    <h2>What challenges would you like to tackle with EvacuDesk?</h2>
                    <p>
                    Our service offers a centralized platform that allows authorities, staff, and volunteers to <br/>
                    efficiently manage shelters, track resources, and respond to evacuee needs during disasters.
                    </p>
        
                    <div className="about-three-card-root">
                        <div className="about-three-card">
                            <div className="square-image">
                            <img src={awareness}/>
                            </div>
                            
                            <div className="square-color">
                            <h2>Low Awareness</h2>
                            <p>Many communities remain unprepared for emergencies. </p>
                            </div>
                        </div>
            
                        <div className="about-three-card">
                            <div className="square-image">
                            <img src={accessControl}  />
                            </div>
                            
                            <div className="square-color">
                            <h2>Accessibility</h2>
                            <p>Ensuring tools are usable by children, elderly, and persons with disabilities.</p>
                            </div>
                        </div>
            
                        <div className="about-three-card">
                            <div className="square-image">
                            <img src={socialMedia} />
                            </div>
                            
                            <div className="square-color">
                            <h2>Community Engagement</h2>
                            <p>Motivating people to join drills and preparedness programs</p>
                            </div>
                        </div>
            
                        <div className="about-three-card">
                            <div className="square-image">
                            <img src={ageLimit}  />
                            </div>
                            
                            <div className="square-color">
                            <h2>Technology Limitations</h2>
                            <p>Creating solutions that work even with weak internet or power.</p>
                            </div>
                        </div>
                    </div>

                    <div className="about-three-card-root">
                        <div className="about-three-card">
                            <div className="square-image">
                            <img src={handshake} />
                            </div>
                            
                            <div className="square-color">
                            <h2>Disaster Coordination</h2>
                            <p>Bridging gaps between authorities, responders, and communities.</p>
                            </div>
                        </div>
            
                        <div className="about-three-card">
                            <div className="square-image">
                            <img src={preparedness}  />
                            </div>
                            
                            <div className="square-color">
                            <h2>Sustained Preparedness</h2>
                            <p>Encouraging long-term safety habits, not just one-time readiness.</p>
                            </div>
                        </div>
            
                        <div className="about-three-card">
                            <div className="square-image">
                            <img src={organizationalResources} />
                            </div>
                            
                            <div className="square-color">
                            <h2>Resource Constraints</h2>
                            <p>Addressing the lack of affordable, reliable emergency tools.</p>
                            </div>
                        </div>
            
                        <div className="about-three-card">
                            <div className="square-image">
                            <img src={rumor}  />
                            </div>
                            
                            <div className="square-color">
                            <h2>Misinformation</h2>
                            <p>Combating false information during crises to ensure trust and safety.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function AboutFour() {
    return(
        <>
            <div className="about-four">
                <div className="about-four-body">
                    <div className="about-four-image">
                        <img src={mission} />
                    </div>
                    <div className="about-four-text">
                        <h2>Our Mission</h2>
                        <p>To provide innovative, reliable, and accessible emergency 
                            preparedness solutions that empower individuals, families, 
                            schools, businesses, and communities to stay safe, informed, 
                            and resilient. We aim to enhance awareness, strengthen 
                            coordination, and promote proactive safety habits that reduce 
                            risks and improve responses during disasters.</p>
                    </div>
                </div>
            </div>
        </>
    )
}

function AboutFive() {
    return(
        <>
            <div className="about-five">
                <div className="about-five-body">
                    <div className="about-five-text">
                        <h2>Our Vision</h2>
                        <p>To create a world where every community is prepared, 
                            connected, and capable of responding effectively to 
                            any disaster or emergency. We envision a society where 
                            safety, readiness, and resilience are integral to 
                            everyday life, ensuring the well-being of people and the 
                            continuity of communities during crises.</p>
                    </div>
                    <div className="about-five-image">
                        <img src={vision}/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default About