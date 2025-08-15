// src/components/Modal.jsx

import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) {
        return null;
    }

    return (
        // Main overlay
        <div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
            onClick={onClose} // Close modal if overlay is clicked
        >
            {/* Modal content container */}
            <div
                className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm"
                onClick={e => e.stopPropagation()} // Prevent clicks inside the modal from closing it
            >
                <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white text-2xl"
                    >
                        &times;
                    </button>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;