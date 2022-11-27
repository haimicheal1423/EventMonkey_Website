import React from 'react';
import { useState } from 'react';
import './Banner.css';

import Button from 'react-bootstrap/Button';
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

                <Button
                    className='search-button'
                    onClick={() => navigate(`/event?keyword=${searchText}`)}>Search</Button> {' '}
                <Button
                    variant='success'
                    onClick={() => navigate(`/event`)}>View All</Button>{' '}
            </form>
            
        </div>
    );
}
