// src/components/Chip.jsx

import React from 'react';

const Chip = ({ chipName, owner, chipType, onClick, onLongPress }) => {
    const isBadChip = chipType === 'bad';

    const chipColor = isBadChip
        ? 'bg-red-500 border-red-700'
        : 'bg-green-500 border-green-700';
    const ownerColor = isBadChip ? 'text-red-200' : 'text-green-200';

    const handleContextMenu = (e) => {
        e.preventDefault(); // Prevent the default right-click menu
        if (onLongPress) {
            onLongPress();
        }
    };

    return (
        <button
            onClick={onClick}
            onContextMenu={handleContextMenu}
            className={`w-28 h-28 rounded-full flex flex-col justify-center items-center p-2 text-center shadow-lg border-4 transition-transform hover:scale-105 ${chipColor}`}
            aria-label={`Chip: ${chipName}. ${owner ? `Owned by ${owner}` : 'Unowned'}. Long press for description.`}
        >
            <span className="font-bold text-sm leading-tight">{chipName}</span>
            {owner && (
                <span className={`mt-1 text-xs font-semibold italic ${ownerColor}`}>
                    {owner}
                </span>
            )}
        </button>
    );
};

export default Chip;
