// src/components/Chip.jsx

import React from 'react';

// We can define the chip types here to control their color
const BAD_CHIPS = [
    'Bogey ', 'Double ', 'Triple+ ', 'Air Ball ', 'Tree ',
    'Penalty Stroke ', 'Dethroned '
];

const Chip = ({ chipName, owner }) => {
    // Determine chip color based on its type
    const isBadChip = BAD_CHIPS.includes(chipName);
    const chipColor = isBadChip
        ? 'bg-red-500 border-red-700'
        : 'bg-green-500 border-green-700';
    const ownerColor = isBadChip ? 'text-red-200' : 'text-green-200';

    return (
        <div className={`w-28 h-28 rounded-full flex flex-col justify-center items-center p-2 text-center shadow-lg border-4 ${chipColor}`}>
            <span className="font-bold text-sm leading-tight">{chipName}</span>
            {owner && (
                <span className={`mt-1 text-xs font-semibold italic ${ownerColor}`}>

                </span>
            )}
        </div>
    );
};

export default Chip;