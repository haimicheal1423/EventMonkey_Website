import React from 'react'

import '../assets/css/aboutUsPageCSS.css'

import Card from 'react-bootstrap/Card'

import AustinLogo from '../assets/profileImages/Potato.jpeg'
import MichealLogo from '../assets/profileImages/Cris Cross.jpeg'
import RobinLogo from '../assets/profileImages/clownsquare.png'
import MikeLogo from '../assets/profileImages/michael.gif'
import SajanLogo from '../assets/profileImages/kobe.png'
import MattLogo from '../assets/profileImages/tako.png'
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';

export default function AboutUs() {
  return (
    <>
      <div className="about-title">About Us</div>
      <hr/>

      <div className="about">
        {/* <!--Austin Ocampo About Us Card--> */}
        <Card className="about-card" id="team-lead">
            <div className="profile-image-section">
              <img src={AustinLogo} alt=""/>
            </div>
            <div className="person-name-section">
                <h2 className="name">Austin Ocampo</h2>
                <h3 className="role">Team Lead</h3>
            </div>
            <div className="basic-info-section">
                <h4 className="info"><PersonIcon/> 0</h4>
                <h4 className="info"><WorkIcon/> Student</h4>
                <h4 className="info"><LocationOnIcon/> San Francisco, CA</h4>
                <h4 className="info"><EmailIcon/> wocampo@mail.sfsu.edu</h4>
            </div>
            <div className="knowledge-section">
                <h4 className="section-title">Skills</h4>
                <div className="skills">
                    <ul className="listNames">
                        <li>Javascript</li>
                        <li>Express</li>
                        <li>React</li>
                        <li>Digital Ocean</li>
                        <li>Python</li>
                        <li>Java</li>
                        <li>Fishing</li>
                        <li>Cars</li>
                    </ul>
                    <ul className="proficiency">
                        {/* <!--Knowledge 1--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                        </li>
                        {/* <!--Knowledge 2--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 3--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 4--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 5--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                        </li>
                        {/* <!--Knowledge 6--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                        </li>
                        {/* <!--Knowledge 7--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                        </li>
                        {/* <!--Knowledge 8--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="extra-notes-section">
                <h4 className="section-title">Bio</h4>
                <p>
                    My first name is William Austin, but I go by Austin. I am a Computer Science Major at San Francisco State
                    University with currently one year remaining. Other than school I am a Staff Sergeant in United States
                    Marine Corps. My goal after finishing college is to work for any company that wants to hire a newly
                    graduated software engineer. Eventually, I would like to work with companies such as Apple, Samsung, and
                    Microsoft to work with product development. When I am not at school or working, you can usually find me
                    by the water fishing.
                </p>
            </div>
        </Card>
        
        {/* <!--Micheal Hua About Us Card--> */}
        <Card className="about-card" id="scrum-master">
            <div className="profile-image-section">
              <img src={MichealLogo} alt=""/>
            </div>
            <div className="person-name-section">
                <h2 className="name">Micheal Hua</h2>
                <h3 className="role">Scrum Master</h3>
            </div>
            <div class="basic-info-section">
                <h4 className="info"><PersonIcon/> 22</h4>
                <h4 className="info"><WorkIcon/> Student</h4>
                <h4 className="info"><LocationOnIcon/> San Francisco, CA</h4>
                <h4 className="info"><EmailIcon/>  mhua1@mail.sfsu.edu</h4>
            </div>
            <div className="knowledge-section">
                <h4 className="section-title">Skills</h4>
                <div className="skills">
                    <ul className="listNames">
                        <li>Javascript</li>
                        <li>Express</li>
                        <li>React</li>
                        <li>Amazon AWS</li>
                        <li>Java</li>
                        <li>SQL</li>
                        <li>Gaming</li>
                        <li>Afro</li>
                    </ul>
                    <ul className="proficiency">
                        {/* <!--Knowledge 1 (JavaScript)--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                        </li>
                        {/* <!--Knowledge 2 (Express)--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 3 (React)--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 4 (Amazon AWS)--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 5 (Java)--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 6 (SQL)--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 7 (Gaming)--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 8 (Afro)--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="extra-notes-section">
                <h4 className="section-title">Bio</h4>
                <p>
                    "One day.... I'm gonna make the onions cry"
                    If your friends turns into family, you got a pretty good group of people.
                </p>
            </div>
        </Card>
        
        {/* <!--Robin Rillon About Us Card--> */}
        <Card className="about-card" id="frontend-lead">
            <div className="profile-image-section">
              <img src={RobinLogo} alt=""/>
            </div>
            <div className="person-name-section">
                <h2 className="name">Robin Rillon</h2>
                <h3 className="role">Front-End Lead</h3>
            </div>
            <div className="basic-info-section">
                <h4 className="info"><PersonIcon/> 0</h4>
                <h4 className="info"><WorkIcon/> Student</h4>
                <h4 className="info"><LocationOnIcon/> San Francisco, CA</h4>
                <h4 className="info"><EmailIcon/> rrillon@mail.sfsu.edu</h4>
            </div>
            <div className="knowledge-section">
                <h4 className="section-title">Skills</h4>
                <div className="skills">
                    <ul className="listNames">
                        <li>Javascript</li>
                        <li>Express</li>
                        <li>React</li>
                        <li>Amazon AWS</li>
                        <li>Python</li>
                        <li>Java</li>
                        <li>Python</li>
                        <li>Clown</li>
                    </ul>
                    <ul className="proficiency">
                        {/* <!--Knowledge 1--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                        </li>
                        {/* <!--Knowledge 2--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 3--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 4--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 5--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                        </li>
                        {/* <!--Knowledge 6--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 7--> */}
                        <li>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 8--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="extra-notes-section">
              <h4 className="section-title">Bio</h4>
              <p>
                "Not everything that goes through your head is a great idea." -JFK
              </p>
            </div>
        </Card>
        
        {/* <!--Michael Maksoudian About Us Card--> */}
        <Card className="about-card" id="team-lead">
            <div className="profile-image-section">
              <img src={MikeLogo} alt=""/>
            </div>
            <div className="person-name-section">
                <h2 className="name">Michael Maksoudian</h2>
                <h3 className="role">Back-End Lead</h3>
            </div>
            <div className="basic-info-section">
                <h4 className="info"><PersonIcon/> 0</h4>
                <h4 className="info"><WorkIcon/> Student</h4>
                <h4 className="info"><LocationOnIcon/> San Francisco, CA</h4>
                <h4 className="info"><EmailIcon/> mmaksoudian@mail.sfsu.edu</h4>
            </div>
            <div className="knowledge-section">
                <h4 className="section-title">Skills</h4>
                <div className="skills">
                    <ul className="listNames">
                        <li>Javascript</li>
                        <li>Express</li>
                        <li>React</li>
                        <li>Amazon AWS</li>
                        <li>Java</li>
                        <li>SQL</li>
                        <li>Intellij IDEA</li>
                        <li>Creativity</li>
                    </ul>
                    <ul className="proficiency">
                        {/* <!--Knowledge 1--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 2--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 3--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 4--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 5--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                        </li>
                        {/* <!--Knowledge 6--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 7--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                        </li>
                        {/* <!--Knowledge 8--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="extra-notes-section">
              <h4 className="section-title">Bio</h4>
              <p>
                This is my last semester at SFSU before I graduate. I like to challenge myself with researching areas in
                computer science that I have no knowledge in. Recently, I have been interested in learning about how
                programming languages work through compiler/decompiler design. I enjoy learning about the graph theory
                involved, and how data flow and control flow analysis work.
              </p>
            </div>
        </Card>
        
        {/* <!--Sajan Gurung About Us Card--> */}
        <Card className="about-card" id="team-lead">
            <div className="profile-image-section">
              <img src={SajanLogo} alt=""/>
            </div>
            <div className="person-name-section">
                <h2 className="name">Sajan Gurung</h2>
                <h3 className="role">Back-End lead</h3>
            </div>
            <div className="basic-info-section">
                <h4 className="info"><PersonIcon/> 0</h4>
                <h4 className="info"><WorkIcon/> Student</h4>
                <h4 className="info"><LocationOnIcon/> San Francisco, CA</h4>
                <h4 className="info"><EmailIcon/> gsajan21@gmail.com</h4>
            </div>
            <div className="knowledge-section">
                <h4 className="section-title">Skills</h4>
                <div className="skills">
                    <ul className="listNames">
                        <li>Javascript</li>
                        <li>Express</li>
                        <li>React</li>
                        <li>Amazon AWS</li>
                        <li>Java</li>
                        <li>Python</li>
                        <li>C</li>
                        <li>Walking</li>
                    </ul>
                    <ul className="proficiency">
                        {/* <!--Knowledge 1--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 2--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 3--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 4--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 5--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                        </li>
                        {/* <!--Knowledge 6--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 7--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 8--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="extra-notes-section">
              <h4 className="section-title">Bio</h4>
              <p>
                Hi, my name is Sajan Gurung. I am the Back-End Lead for team-02.
              </p>
            </div>
        </Card>
        
        {/* <!--Matthew Lee About Us Card--> */}
        <Card className="about-card" id="team-lead">
            <div className="profile-image-section">
              <img src={MattLogo} alt=""/>
            </div>
            <div className="person-name-section">
                <h2 className="name">Matthew Lee</h2>
                <h3 className="role">Github Master</h3>
            </div>
            <div className="basic-info-section">
                <h4 className="info"><PersonIcon/> 0</h4>
                <h4 className="info"><WorkIcon/> Student</h4>
                <h4 className="info"><LocationOnIcon/> San Francisco, CA</h4>
                <h4 className="info"><EmailIcon/> mlee56@mail.sfsu.edu</h4>
            </div>
            <div className="knowledge-section">
                <h4 className="section-title">Skills</h4>
                <div className="skills">
                    <ul className="listNames">
                        <li>Javascript</li>
                        <li>Express</li>
                        <li>React</li>
                        <li>Amazon AWS</li>
                        <li>HTML</li>
                        <li>Python</li>
                        <li>Sleeping</li>
                        <li>Drawing</li>
                    </ul>
                    <ul className="proficiency">
                        {/* <!--Knowledge 1--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 2--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 3--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 4--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 5--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 6--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                            <span className="circleE"></span>
                        </li>
                        {/* <!--Knowledge 7--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                        </li>
                        {/* <!--Knowledge 8--> */}
                        <li>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circle"></span>
                            <span className="circleE"></span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="extra-notes-section">
              <h4 className="section-title">Bio</h4>
              <p>
                A computer science student of San Francisco State University, with one year remaining
                before off into the real world I go. Favorite things include sleeping, drawing, and VTubers.
                I am the GitHub Master for Team 02 of Class CSC 648-01 of Fall 2022. By the way, did I mention
                I like sleeping...
              </p>
            </div>
        </Card>
      </div>
    </>
    
  )
}
