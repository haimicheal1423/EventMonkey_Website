import React from 'react'
import ReactDOM from 'react-dom'
import './Modal.css'

//Modal = Fades bg and central popup.
export default function Modal({ children, handleclose }) {
  return ReactDOM.createPortal(
    <div className="modal-backdrop">
        <div className="modal">
            {children}
            <button onClick={handleclose}>close</button>
        </div>
    </div>
  )
}
