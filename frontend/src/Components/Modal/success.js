import React from 'react';
import './Modals.css'; // You can create a custom CSS for styling the modal

const Modal = ({ message, onClose, isSuccess }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isSuccess ? 'Success' : 'Error'}</h2>
        <p>{message}</p>
        <button onClick={onClose} className="modal-close-button">Close</button>
      </div>
    </div>
  );
};

export default Modal;
