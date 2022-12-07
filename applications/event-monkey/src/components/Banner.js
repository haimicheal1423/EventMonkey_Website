import React, { useState } from 'react';
import './Banner.css';

import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import Form from "react-bootstrap/Form";

export default function BannerEM() {

    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();

    return (
      <div className="banner container">
        <h1 className="bannerTitle">Still looking for your next event?</h1>

        <form className='bannerForm input-group'>

          <Form.Group className="bannerSearch border-warning" controlId='searchBar'>
            <div className='d-flex flex-wrap justify-content-center'>

              <Form.Control
                type='text'
                name='keyword'
                placeholder='Get started with EventMonkey!'
                style={{width: '17rem', margin: '0.25rem'}}
                onChange={e => setSearchText(e.target.value)}
              />

              <div>
                <Button className='search-button m-1' onClick={() => navigate(`/event/search?keyword=${searchText}`)}>
                  Search
                </Button>

                <Button variant='success' className='m-1' onClick={() => navigate(`/event`)}>
                  View All Events
                </Button>
              </div>

            </div>
          </Form.Group>
        </form>
      </div>
    );
}
