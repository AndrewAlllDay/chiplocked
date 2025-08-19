// src/components/Chip.jsx

import React from 'react';

import AceImage from '../assets/images/ace.png';
import EagleImage from '../assets/images/eagle.png';
import BirdieImage from '../assets/images/birdie.png';
import ThrowInImage from '../assets/images/throw-in.png';
import BigPutterImage from '../assets/images/big-putter.png';
import StrokeImage from '../assets/images/stroke.png';
import DropInImage from '../assets/images/drop-in.png';
import RescueRangerImage from '../assets/images/rescue-ranger.png';
import ScrambleImage from '../assets/images/scramble.png';
import PuredImage from '../assets/images/pured.png';
import BogeyImage from '../assets/images/bogey.png';
import DoubleImage from '../assets/images/double.png';
import TriplePlusImage from '../assets/images/triple-plus.png';
import AirBallImage from '../assets/images/air-ball.png';
import TreeImage from '../assets/images/tree.png';
import PenaltyStrokeImage from '../assets/images/penalty-stroke.png';
import DethronedImage from '../assets/images/dethroned.png';

const chipImages = {
    'Ace': AceImage,
    'Eagle': EagleImage,
    'Birdie': BirdieImage,
    'Throw-in': ThrowInImage,
    'Big Putter': BigPutterImage,
    'Stroke': StrokeImage,
    'Drop-in': DropInImage,
    'Rescue Ranger': RescueRangerImage,
    'Scramble': ScrambleImage,
    'Pured': PuredImage,
    'Bogey': BogeyImage,
    'Double': DoubleImage,
    'Triple+': TriplePlusImage,
    'Air Ball': AirBallImage,
    'Tree': TreeImage,
    'Penalty Stroke': PenaltyStrokeImage,
    'Dethroned': DethronedImage,
};

const Chip = ({ chipName, owner, onClick, onLongPress }) => {

    const handleContextMenu = (e) => {
        e.preventDefault(); // Prevent the default right-click menu

        // Check for vibration support and trigger a pattern.
        // The pattern [100, 30, 100] vibrates for 100ms, pauses for 30ms, and vibrates again for 100ms.
        if ("vibrate" in navigator) {
            navigator.vibrate([100, 30, 100]);
        }

        if (onLongPress) {
            onLongPress();
        }
    };

    const chipImageSrc = chipImages[chipName];

    return (
        <button
            onClick={onClick}
            onContextMenu={handleContextMenu}
            className="w-28 h-28 flex flex-col justify-center items-center text-center shadow-none transition-transform hover:scale-105 focus:outline-none focus:ring-0"
            aria-label={`${chipName}. ${owner ? `Owned by ${owner}` : 'Unowned'}. Long press for description.`}
        >
            {chipImageSrc ? (
                <img
                    src={chipImageSrc}
                    alt={chipName}
                    className="w-full h-full object-cover rounded-full"
                    style={{ filter: 'drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.7))' }}
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