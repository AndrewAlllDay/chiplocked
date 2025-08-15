// src/components/GameScreen.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const CHIP_LIST = [
    'Ace Chip', 'Eagle Chip', 'Birdie Chip', 'Throw-in Chip', 'Big Putter Chip',
    'Stroke Chip', 'Drop-in Chip', 'Rescue Ranger Chip', 'Scramble Chip', 'Pured Chip',
    'Bogey Chip', 'Double Chip', 'Triple+ Chip', 'Air Ball Chip', 'Tree Chip',
    'Penalty Stroke Chip', 'Dethroned Chip',
    'Bonus Chip',
];

const GameScreen = () => {
    const { gameId } = useParams();
    const [game, setGame] = useState(null);
    const [selectedChip, setSelectedChip] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState(null);

    useEffect(() => {
        const playerName = sessionStorage.getItem('playerName');
        setCurrentPlayer(playerName);
    }, []);

    useEffect(() => {
        if (!gameId) return;
        const gameDocRef = doc(db, 'games', gameId);
        const unsubscribe = onSnapshot(gameDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                setGame({ id: docSnapshot.id, ...docSnapshot.data() });
            } else {
                setGame(null);
            }
        });
        return () => unsubscribe();
    }, [gameId]);

    const handleAssignChip = async (chipName, playerName) => {
        if (currentPlayer !== game.host) {
            alert("Only the host can assign chips!");
            return;
        }

        const gameDocRef = doc(db, 'games', gameId);
        const fieldToUpdate = `chipState.${chipName}`;
        await updateDoc(gameDocRef, { [fieldToUpdate]: playerName });
        setSelectedChip(null);
    };

    // If the game data or current player name hasn't loaded yet, show a loading screen.
    if (!game || !currentPlayer) {
        return (
            <div className="bg-slate-900 text-white min-h-screen flex justify-center items-center">
                <h1 className="text-3xl font-bold">Loading Game...</h1>
            </div>
        );
    }

    const isHost = currentPlayer === game.host;

    // Calculate the player's own chips (for the player view)
    const myChips = Object.entries(game.chipState || {})
        .filter(([chip, owner]) => owner === currentPlayer)
        .map(([chip]) => chip);

    return (
        <div className="bg-slate-900 text-white min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center mb-6">
                    <span className="text-slate-400">Share this Room Code:</span>
                    <span className="text-2xl font-bold text-yellow-400 tracking-widest">{game.roomCode}</span>
                </div>

                {isHost ? (
                    // HOST VIEW
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800 p-6 rounded-lg">
                            <h2 className="text-2xl font-semibold mb-4">Players ({game.players.length})</h2>
                            <ul className="space-y-2">
                                {game.players.map((player) => (
                                    <li key={player} className={`bg-slate-700 p-3 rounded-md text-lg ${player === game.host ? 'border-l-4 border-cyan-400' : ''}`}>
                                        {player} {player === game.host && <span className="text-xs text-cyan-400 ml-2">(Host)</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-lg md:row-span-2">
                            <h2 className="text-2xl font-semibold mb-4">Chip Tracker (Host View)</h2>
                            <div className="space-y-3">
                                {CHIP_LIST.map((chip) => (
                                    <div key={chip} className="bg-slate-700 p-3 rounded-md">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">{chip}</span>
                                            <span className="text-yellow-400">{game.chipState?.[chip] || 'Unclaimed'}</span>
                                        </div>
                                        {selectedChip === chip && (
                                            <div className="mt-3 pt-3 border-t border-slate-600 flex flex-wrap gap-2">
                                                <p className="w-full text-sm text-slate-400 mb-1">Assign to:</p>
                                                {game.players.map((player) => (
                                                    <button key={player} onClick={() => handleAssignChip(chip, player)} className="bg-cyan-600 text-sm hover:bg-cyan-700 rounded-md px-3 py-1 font-semibold">{player}</button>
                                                ))}
                                                <button onClick={() => handleAssignChip(chip, null)} className="bg-slate-500 text-sm hover:bg-slate-600 rounded-md px-3 py-1 font-semibold">Unclaim</button>
                                            </div>
                                        )}
                                        <button onClick={() => setSelectedChip(selectedChip === chip ? null : chip)} className="w-full text-left mt-2 text-cyan-400 text-sm font-semibold">
                                            {selectedChip === chip ? 'Cancel' : 'Update Holder'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    // PLAYER VIEW
                    <div className="bg-slate-800 p-6 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4">My Chips ({myChips.length})</h2>
                        <ul className="space-y-2">
                            {myChips.length > 0 ? (
                                myChips.map((chip) => (
                                    <li key={chip} className="bg-slate-700 p-3 rounded-md text-lg">
                                        {chip}
                                    </li>
                                ))
                            ) : (
                                <p className="text-slate-400">You are not currently holding any chips.</p>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameScreen;