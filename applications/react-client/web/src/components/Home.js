import { useState } from 'react'
import { useNavigate, Link } from "react-router-dom";
import Button from 'react-bootstrap/Button';

function Home() {
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();
    return (
        <div>
            <section className="banner">
                <img src="profileImages/eventmonkey-home-banner.jpg" alt="" />
                <div className="welcome">
                    <h2>Still looking for your next event?</h2>
                    <div style={{ alignItem: 'center' }}>
                        <input type="text" placeholder="Search..." onChange={(e) => setSearchText(e.target.value)} style={{ marginRight: 10, padding: 3 }} />
                        <Button variant="primary" size="lg" onClick={() => navigate(`/event/${searchText}`)}>Search</Button>{' '}
                        <Button variant="success" size="lg" onClick={() => navigate('/event')}>View All Events</Button>{' '}
                    </div>
                </div>
            </section>

            <main>
                <article>
                    <h2>Browse by Category </h2>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere quaerat numquam quasi est totam, voluptatibus blanditiis sunt, maiores dolorem cum hic dolores veritatis expedita tempora! Doloremque exercitationem necessitatibus natus fugiat!</p>

                    <ul className="images">
                        <li><a className="browsebycategory-link" href=""><img src="profileImages/clownsquare.png" />Concerts</a></li>
                        <li><a className="browsebycategory-link" href=""><img src="profileImages/clownsquare.png" />Sports</a></li>
                        <li><a className="browsebycategory-link" href=""><img src="profileImages/clownsquare.png" />Events</a></li>
                    </ul>
                </article>
            </main>
        </div>
    );
}

export default Home;
