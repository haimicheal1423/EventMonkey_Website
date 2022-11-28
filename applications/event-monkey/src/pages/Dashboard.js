import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/esm/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useNavigate } from 'react-router';

import '../assets/css/dashboard.css'

import George from '../assets/profileImages/george-avatar.jpeg'


function Dashboard() {
    const navigate = useNavigate();
    return (
        <Container>
            <div className="welcome-container">
                <img className="welcome-img shadow"src={George} alt=""/>
                <h2 className="dashboard-title">Welcome Sajan!</h2>
                <h6 className="dashboard-subtitle">This is your personalized dashboard..</h6>
                <Button className="logout-btn" onClick={() => {
                    localStorage.setItem('token',"");
                    window.location.href = '/';
                }}>logout</Button>
                <hr/>
            </div>

            <div className="tsn-container">
                <h6>Try Something New</h6>
                {/* carousel here? */}
                <hr/>
            </div>

            <div className="rec-container">
                <h6>Recommended Just For You!</h6>
                {/* carousel here? */}
                <hr/>
            </div>

            <div className="category-container">
                <h6>Browse by Category</h6>
                {/* carousel here? */}
                <hr/>
            </div>

            <div className="recent-container">
                <h6>Recent Events</h6>
                {/* carousel here? */}
                <hr/>
            </div>

            {/* <Row>
                <Col></Col>
                <Col>
                    <Card style={{ width: '18rem'}}>
                        <Card.Img variant="top" src="holder.js/100px180?text=Image cap" />
                        <Card.Body>
                            <Card.Title>Welcome Sajan!</Card.Title>
                            <Card.Text>
                                Some quick example text to build on the card title and make up the
                                bulk of the card's content.
                            </Card.Text>
                        </Card.Body>
                        <ListGroup className="list-group-flush">
                            <ListGroup.Item>Sajan Gururng</ListGroup.Item>
                            <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
                            <ListGroup.Item  onClick={() => {
                                localStorage.setItem('token',false);
                                navigate('/');
                            }}>Logout</ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
                <Col></Col>
            </Row> */}

        </Container>
    );
}

export default Dashboard;
