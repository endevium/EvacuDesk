import { useState } from 'react'
import bodyImage from '../assets/body-image.png'
import secondaryBodyImage from '../assets/secondary-body-image.png'
import raiseHands from '../assets/raise-hands.png'
import gala from '../assets/gala.png'
import donation from '../assets/donation.png'
import fourthBodyImage from '../assets/fourth-image.png'
import fifthImage from '../assets/fifth-image.png'
import bulbCard from '../assets/bulb-card.png'
import handCard from '../assets/hand-card.png'
import cycleCard from '../assets/cycle-card.png'
import sixthImage from '../assets/sixth-image.png'
import family from '../assets/family.png'
import emergencyResponse from '../assets/emergency-response.png'
import empowerment from '../assets/empowerment.png'
import support from '../assets/support.png'
import eighthImage from '../assets/eighth-image.png'
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom'
import '../css/App.css'
import Header from './Header'
import Footer from './Footer'
import About from './About'
import News from './News'
import Contact from './Contact'
import AdminLogin from './AdminLogin'
import Login from './Login'
import Register from './Register'
import Evacuee from './Evacuee'
import Staff from './Staff'

function App() {
  return (
    <> 
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/news' element={<News />}/>
          <Route path='/contact' element={<Contact />}/>
          <Route path='/login' element={<Login />}/>
          <Route path='/adl' element={<AdminLogin />}/>
          <Route path='/register' element={<Register />}/>

          <Route path='/evacuee' element={<Evacuee />}/>
          <Route path='/staff' element={<Staff />}/>
        </Routes>
      </Router>
    </>
  )
}

function Home() {
  return(
    <>
      <Header/>
      <Body/>
      <SecondaryBody/>
      <ThirdBody/>
      <FourthBody/>
      <FifthBody/>
      <SixthBody/>
      <SeventhBody/>
      <EighthBody/>
      <Footer/>
    </>
  )
}

function Body() {
  return(
    <>
      <div className="main-body">
        <div className="body-color">
          <img src={bodyImage} className="body-image"></img>
          <div className="body-text">
            <p>Evacuation Made Easy</p>
            <h2>Centralized Center Solutions <br/>
              for Every Crisis</h2>
            <p>EvacuDesk ensures efficient shelter management, empowering <br/>
            communities with safety, organization, and streamlined disaster <br/>
            response.</p>
            <button className="get-started-button">Get Started</button>
          </div>
        </div>
      </div>
    </>
  )
}

function SecondaryBody() {
  return(
    <>
      <div className="secondary-body">
        <div className="secondary-body-color">
          <img src={secondaryBodyImage} className="secondary-image"></img>
          <div className="secondary-body-text">
            <p>Welcome to EvacuDesk</p>
            <h2>Helping Each Other <br/>
              Can Make World Better</h2>
            <p>Helping each other is a simple yet powerful way to make the <br/>
              world better. Through kindness and cooperation, we ease <br/>
              burdens and build stronger communities. By supporting one <br/>
              another, we create a culture of compassion that leads to a more <br/>
              peaceful and hopeful world. <br/>
              
              <br/>
              <br/>
              
              -Welcome with Care<br/>
              -Helping Hands Unite<br/>
              -Compassion in Action<br/>
              -Kindness Builds Hope<br/>
              </p>
            <button className="discover-button">Discover More</button>
          </div>
        </div>
      </div>
    </>
  )
}

function ThirdBody() {
  return(
    <>
      <div className="third-body">
        <div className="squares-root">
          <div className="square-card">
            <div className="square-image">
              <img src={raiseHands} alt="hands-up" />
            </div>
            
            <div className="square-color">
              <h2>Become a Volunteer</h2>
              <p>Lend your time, skills, and <br/>
                heart to support communities <br/>
                in need. </p>
            </div>
          </div>

          <div className="square-card">
            <div className="square-image">
              <img src={gala} alt="gala" />
            </div>
            
            <div className="square-color">
              <h2>Quick Fundraise</h2>
              <p>Small actions can create big <br/>
                impacts for communities <br/>
                in need. </p>
            </div>
          </div>

          <div className="square-card">
            <div className="square-image">
              <img src={donation} alt="donation" />
            </div>
            
            <div className="square-color">
              <h2>Start Donating</h2>
              <p>Transform compassion into <br/>
                action and help build a <br/>
                brighter future for others. </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function FourthBody() {
  return(
    <>
      <div className="fourth-body">
        <div className="fourth-body-color">
          <img src={fourthBodyImage} className="fourth-image"></img>
          <div className="body-text">
            <p>WHY CHOOSE US?</p>
            <h2>We Stand Out By Offering Trusted <br/>
              Support, Proven Solution and <br/>
              Dedicated Service</h2>
            <p>Choosing us means trusting a team built on compassion, service, and <br/>
              integrity. We provide reliable support, genuine care, and lasting impact <br/>
              to create stronger communities and brighter futures for all.</p>

            <br/>
            <br/>
            <br/>

            <ul className="fourth-body-list">
              <li>
                <p className="list-title"><b>Trusted Service</b></p>
                <p>We are committed to providing reliable and consistent support, ensuring <br/>
                  every need is met with professionalism. Our dedication builds confidence <br/>
                  that you can depend on us in any situation.</p>
              </li>

              <li>
                <p className="list-title"><b>Genuine Care</b></p>
                <p>Beyond just service, we prioritize compassion and empathy. Every action is  <br/>
                focused on uplifting lives, supporting communities, and making sure people feel  <br/>
                that you can depend on us in any situation.</p>
              </li>

              <li>
                <p className="list-title"><b>Lasting Impact</b></p>
                <p>Our goal is not only to respond to immediate needs but also to create sustainable change.  <br/>
                Through meaningful initiatives, we help build stronger, safer, and brighter futures for  <br/>
                everyone</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}


function FifthBody() {
  return(
    <>
      <div className="fifth-body">
        <div className="fifth-body-root">
          <img src={fifthImage} className="fifth-image" />

          <div className="fifth-body-text">
            <h2>
              Overcoming The Issues <br/>
              With Our True Values
            </h2>

            <div className="fifth-body-card fcard-one">
              <div className="fcard-img"><img src={bulbCard} alt="card"/></div>
              <div className="fcard-text">
                <p className="fcard-title"><b>Identify the Core Problem</b></p>
                <p>
                To overcome any issue, we must first understand its true cause and
                effects. This means carefully observing the situation, recognizing 
                patterns, and listening to others. By identifying the root problem,
                we create a clear foundation for positive solutions.
                </p>
              </div>
            </div>

            <div className="fifth-body-card fcard-two">
              <div className="fcard-img"><img src={handCard} alt="card"/></div>
              <div className="fcard-text">
                <p className="fcard-title"><b>Apply True Values</b></p>
                <p>
                Once we know the problem, we must rely on our true values—such as
                honesty, respect, responsibility, and compassion. These values guide
                decisions, strengthen trust, and help us face challenges with integrity.
                Living by them builds stronger, lasting solutions.
                </p>
              </div>
            </div>

            <div className="fifth-body-card fcard-three">
              <div className="fcard-img"><img src={cycleCard} alt="card"/></div>
              <div className="fcard-text">
                <p className="fcard-title"><b>Take Consistent Actions</b></p>
                <p>
                Solutions only work when paired with consistent action. Through
                teamwork, accountability, and dedication, we can transform values
                into results. Every small effort adds up, creating long-term change
                and proving that true values can overcome any issue.
                </p>
              </div>        
            </div>
          </div>
        </div>
      </div>

    </>
  )
}


function SixthBody() {
  return(
    <>
      <div className="sixth-body">
        <div className="sixth-body-color">
          <img src={sixthImage} className="sixth-image" />
          <div className="sixth-body-text">
            <h2>
              Let's Build More <br/>
              Happiness Together
            </h2>

            <p>
              Happiness becomes more meaningful when it is shared. By <br/>
              working together, supporting one another, and staying true to <br/>
              our values, we create stronger connections that bring joy to <br/>
              both individuals and communities. True happiness does not <br/>
              come only from personal success but from unity, kindness, and <br/>
              compassion that uplift others. When we choose to help, <br/>
              respect, and understand one another, we spread positivity that <br/>
              grows far beyond ourselves. Let’s build more happiness <br/>
              together by making every effort to inspire hope, strengthen <br/>
              relationships, and create a brighter future for everyone.
            </p>

            <button className="join-button">Join Us</button>
          </div>
        </div>
      </div>
    </>
  )
}


function SeventhBody() {
  return(
    <>
      <div className="seventh-body">
        <div className="seventh-body-root">
          <p>Our Services</p>
          <h2>We Are Here to Help Them</h2>
          <p>
          Our service offers a centralized platform that allows authorities, staff, and volunteers to <br/>
          efficiently manage shelters, track resources, and respond to evacuee needs during disasters.
          </p>

          <div className="seventh-square-card-root">
            <div className="seventh-square-card">
              <div className="square-image">
                <img src={family} />
              </div>
              
              <div className="square-color">
                <h2>Centralized Shelter Management</h2>
                <p>Our service provides a centralized platform for efficient evacuation shelter management, enabling staff to track resources, assign volunteers, and respond quickly to evacuee needs. </p>
              </div>
            </div>

            <div className="seventh-square-card">
              <div className="square-image">
                <img src={emergencyResponse} />
              </div>
              
              <div className="square-color">
                <h2>Digital Disaster Response</h2>
                <p>We deliver a modern solution that replaces manual processes with digital tools, streamlining registration, donations, and shelter monitoring during disasters </p>
              </div>
            </div>

            <div className="seventh-square-card">
              <div className="square-image">
                <img src={empowerment} />
              </div>
              
              <div className="square-color">
                <h2>Community Empowerment</h2>
                <p>Our service empowers communities by improving coordination, ensuring transparency, and enhancing disaster response through organized, reliable, and accessible shelter management.</p>
              </div>
            </div>

            <div className="seventh-square-card">
              <div className="square-image">
                <img src={support} />
              </div>
              
              <div className="square-color">
                <h2>Smart Evacuee Support</h2>
                <p>Our service allows evacuees to register, submit requests, and stay informed, giving them easier access to aid and timely updates.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


function EighthBody() {
  return(
    <>
      <div className="eighth-body">
        <div className="eighth-body-color">
          <h2>Smart Evacuation Planning Made Easy</h2>
          <p>Join with EvacuDesk to build safety, strengthen preparedness, protect families, and create resilient <br/>
            communities where everyone is ready for emergencies together.</p>
          <button className="join-now-button">Join Now</button>
        </div>
        <div className="eighth-image">
          <img src={eighthImage} alt="eighthImage"/>
        </div>
      </div>
    </>
  ) 
}

export default App
