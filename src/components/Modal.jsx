// src/components/Modal.jsx

import React from 'react';
import { motion } from 'framer-motion';

const Modal = ({ onClose, title, children }) => {
    return (
        <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} // Backdrop fade can be slightly slower
        >
            <motion.div
                className="bg-slate-800 rounded-lg shadow-xl w-full max-w-sm"
                onClick={e => e.stopPropagation()}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ ease: "easeOut", duration: 0.15 }} // Made snappier
            >
                <div className="flex justify-between items-center border-b border-slate-700 p-4">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="text-slate-400 hover:text-white text-2xl"
                        aria-label="Close modal"
                    >
                        &times;
                    </motion.button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Modal;