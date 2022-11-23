import React from 'react';
import { useState } from 'react';
import './Banner.css';

import { MDBBtn } from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';

export default function BannerEM() {

    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();

    return (
        <div className="banner container">
            <h1 className="bannerTitle">Still looking for your next event?</h1>
            <form className='bannerForm d-flex input-group'>
                <input
                    type='search'
                    className='bannerSearch form-control border-warning'
                    placeholder='Get started with EventMonkey!'
                    onChange={(e) => setSearchText(e.target.value)} />

                <MDBBtn
                    color='warning'
                    onClick={() => navigate(`/event/search?keyword=${searchText}`)}>Search</MDBBtn> {' '}
                <MDBBtn
                    color='success'
                    onClick={() => navigate(`/event`)}>View All Events</MDBBtn>{' '}
            </form>
            <img
                src="./eventmonkey-nobg.png"
                className="img-fluid"
                alt=""
            />

            <hr className="hr" />

            <article>
                <h2>Browse by Category </h2>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere quaerat numquam quasi est totam, voluptatibus blanditiis sunt, maiores dolorem cum hic dolores veritatis expedita tempora! Doloremque exercitationem necessitatibus natus fugiat!</p>
            </article>

        </div>
    );
}
