// src/components/Chip.jsx

import React from 'react';
import BirdieImage from '../assets/images/birdie.png';

const Chip = ({ chipName, owner, onClick, onLongPress }) => {

    const handleContextMenu = (e) => {
        e.preventDefault(); // Prevent the default right-click menu

        // Vibrate the device for a short duration
        if ("vibrate" in navigator) {
            navigator.vibrate(50); // Vibrate for 50 milliseconds
        }

        if (onLongPress) {
            onLongPress();
        }
    };

    const chipImageSrc = BirdieImage;

    return (
        <button
            onClick={onClick}
            onContextMenu={handleContextMenu}
            className="w-28 h-28 rounded-full flex flex-col justify-center items-center p-2 text-center shadow-lg transition-transform hover:scale-105 overflow-hidden"
            aria-label={`${chipName}. ${owner ? `Owned by ${owner}` : 'Unowned'}. Long press for description.`}
        >
            {chipImageSrc ? (
                <img
                    src={chipImageSrc}
                    alt={chipName}
                    className="w-full h-full object-cover rounded-full"
                />
            ) : (
                <span className="font-bold text-sm leading-tight text-white">{chipName}</span>
            )}

            {owner && (
                <span className={`mt-1 text-xs font-semibold italic text-white`}>
                    {owner}
                </span>
            )}
        </button>
    );
};

export default Chip;