import { Alert } from "react-bootstrap";
import { useState } from "react";

export function ErrorAlert(props) {
    const [show, setShow] = useState(true);

    return (
        <Alert show={show} variant='danger' onClose={() => setShow(false)} dismissible className='text-left'>
            {props.header && <Alert.Heading>{props.header}</Alert.Heading>}
            <p>{props.message}</p>
        </Alert>
    );
}
