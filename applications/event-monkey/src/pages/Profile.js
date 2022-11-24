import React from 'react'

import '../assets/css/profile.css'
import RobinLogo from '../assets/profileImages/clownsquare.png'

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'

export default function Profile() {
  return (
    <>
      <div className="profile-image-section">
        <h5 className="customize-profile-title">Customize Profile</h5>
        <hr className="hr" />

        <img src={RobinLogo} alt=""/>
        <div className="image-button-container">
          <Button className="image-button" variant="warning">change</Button>
        </div>
      </div>

    
      <div className="grid-container">
        <div className="profile-section1">
          <label className="profile-input">
                <span className="input-title">Name: </span>
                <input type="text"/>
          </label>
          
          <label className="profile-input">
                <span className="input-title">Email: </span>
                <input type="text"/>
          </label>
        </div>
  
        <div className="profile-section2">
          <label>
                <span>Password: </span>
                <input type="password"/>
          </label>
          
          <label>
                <span>Confirm Password: </span>
                <input type="password"/>
          </label>
        </div>
  
        <div className="profile-section3">
          <label>
                <span>Description: </span>
                <textarea type="textarea"/>
          </label>
        </div>
      </div>
      <Button 
        variant="warning" 
        type="submit" 
        className="submit-button"
        >Submit Changes</Button>
    </>
  )
}
