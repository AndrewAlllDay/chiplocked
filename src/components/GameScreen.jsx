// src/components/GameScreen.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Chip from './Chip';
import Modal from './Modal';

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
    const [isPotModalOpen, setIsPotModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    useEffect(() => {
        // --- CHANGE IS HERE ---
        const playerName = localStorage.getItem('playerName');
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

    const handleHostAssignChip = async (playerName) => {
        if (!selectedChip) return;
        const gameDocRef = doc(db, 'games', gameId);
        const fieldToUpdate = `chipState.${selectedChip}`;
        await updateDoc(gameDocRef, { [fieldToUpdate]: playerName });
        setIsPotModalOpen(false);
        setSelectedChip(null);
    };

    const handlePlayerTransferChip = async (newOwner) => {
        if (!selectedChip) return;
        const currentOwner = game.chipState?.[selectedChip];
        if (currentPlayer !== currentOwner) {
            alert("You can't reassign a chip you don't own!");
            return;
        }
        const gameDocRef = doc(db, 'games', gameId);
        const fieldToUpdate = `chipState.${selectedChip}`;
        await updateDoc(gameDocRef, { [fieldToUpdate]: newOwner });
        setIsTransferModalOpen(false);
        setSelectedChip(null);
    };

    if (!game || !currentPlayer) {
        return (
            <div className="bg-slate-900 text-white min-h-screen flex justify-center items-center">
                <h1 className="text-3xl font-bold">Loading Game...</h1>
            </div>
        );
    }

    const isHost = currentPlayer === game.host;

    const assignedChipsData = game.chipState || {};
    const chipsInPot = CHIP_LIST.filter(chip => !assignedChipsData[chip]);

    const myChips = Object.entries(assignedChipsData)
        .filter(([_chip, owner]) => owner === currentPlayer)
        .map(([chip]) => chip);

    return (
        <div className="bg-slate-900 text-white min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center mb-6">
                    <span className="text-slate-400">Share this Room Code:</span>
                    <span className="text-2xl font-bold text-yellow-400 tracking-widest">{game.roomCode}</span>
                </div>

                <div className="bg-slate-800 p-6 rounded-lg mb-6">
                    <h2 className="text-2xl font-semibold mb-4">My Chips ({myChips.length})</h2>
                    {myChips.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-4">
                            {myChips.map((chip) => (
                                <button
                                    key={chip}
                                    onClick={() => {
                                        setSelectedChip(chip);
                                        setIsTransferModalOpen(true);
                                    }}
                                    className="transition-transform hover:scale-105"
                                >
                                    <Chip chipName={chip} owner={currentPlayer} />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400">You are not currently holding any chips.</p>
                    )}
                </div>

                {isHost && (
                    <div className="text-center">
                        <button
                            onClick={() => setIsPotModalOpen(true)}
                            className="bg-cyan-600 hover:bg-cyan-700 rounded-lg px-6 py-3 font-semibold transition-colors"
                        >
                            Manage Pot
                        </button>
                    </div>
                )}
            </div>

            {/* Modal for the Host's Pot */}
            <Modal
                isOpen={isPotModalOpen}
                onClose={() => {
                    setIsPotModalOpen(false);
                    setSelectedChip(null);
                }}
                title={selectedChip ? `Assign ${selectedChip}` : "Chips in the Pot"}
            >
                {!selectedChip ? (
                    <div className="grid grid-cols-3 gap-y-8 gap-x-4 place-items-center">
                        {chipsInPot.map((chip) => (
                            <button key={chip} onClick={() => setSelectedChip(chip)} className="transition-transform hover:scale-105">
                                <Chip chipName={chip} owner={null} />
                            </button>
                        ))}
                        {chipsInPot.length === 0 && <p className="col-span-3 text-slate-400">All chips have been handed out.</p>}
                    </div>
                ) : (
                    <div className="flex flex-col space-y-2">
                        <p className="text-slate-400 mb-2">Who is holding this chip now?</p>
                        {game.players.map((player) => (
                            <button key={player} onClick={() => handleHostAssignChip(player)} className="bg-cyan-600 w-full text-left hover:bg-cyan-700 rounded-md px-4 py-3 font-semibold transition-colors">
                                {player}
                            </button>
                        ))}
                        <button onClick={() => handleHostAssignChip(null)} className="bg-slate-500 w-full text-left hover:bg-slate-600 rounded-md px-4 py-3 font-semibold transition-colors">
                            Unclaim (Return to Pot)
                        </button>
                    </div>
                )}
            </Modal>

            {/* Modal for Player-to-Player Transfer */}
            <Modal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                title={`Transfer ${selectedChip}`}
            >
                <div className="flex flex-col space-y-2">
                    <p className="text-slate-400 mb-2">Who are you giving this chip to?</p>
                    {game.players
                        .filter(player => player !== currentPlayer)
                        .map((player) => (
                            <button key={player} onClick={() => handlePlayerTransferChip(player)} className="bg-cyan-600 w-full text-left hover:bg-cyan-700 rounded-md px-4 py-3 font-semibold transition-colors">
                                {player}
                            </button>
                        ))}
                </div>
            </Modal>
        </div>
    );
};

export default GameScreen;