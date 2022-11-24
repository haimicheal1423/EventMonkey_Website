import React from 'react'

import BannerEM from '../components/Banner'
import '../assets/css/home.css'

export default function Home() {
  return (
    <>
        <BannerEM/>
        <img
            src="./eventmonkey-nobg.png"
            className="home-banner"
            alt=""
        />
        
        <div className="home-container">
          <hr/>
          <h2>Home</h2>
          <h2>Browse by Category </h2>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere quaerat numquam quasi est totam, voluptatibus blanditiis sunt, maiores dolorem cum hic dolores veritatis expedita tempora! Doloremque exercitationem necessitatibus natus fugiat!</p>
        </div>
    </>
  )
}
