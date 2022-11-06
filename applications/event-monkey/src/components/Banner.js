import React from 'react';
import './Banner.css';

import { MDBBtn } from 'mdb-react-ui-kit';

export default function BannerEM() {
  return (
    <div className="banner container">
        <h1 className="bannerTitle">Still looking for your next event?</h1>
        <form className='bannerForm d-flex input-group'>
            <input 
            type='search' 
            className='bannerSearch form-control border-warning' 
            placeholder='Get started with EventMonkey!' 
            aria-label='Search' />

            <MDBBtn color='warning'>Search</MDBBtn>
        </form>
        <img 
        src="./eventmonkey-nobg.png"
        className="img-fluid"
        alt=""
        />
        <hr className="hr" />
        
    </div>
  );
}
