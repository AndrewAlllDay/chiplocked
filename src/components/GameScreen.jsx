// src/components/GameScreen.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';
import Chip from './Chip';
import Modal from './Modal';
import { AnimatePresence, motion } from 'framer-motion';

// Animation variants for staggered lists (like the chip bag)
const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
};


const GameScreen = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [allChips, setAllChips] = useState([]);
    const [selectedChip, setSelectedChip] = useState(null);
    const [chipForDescription, setChipForDescription] = useState(null);
    const [isPotModalOpen, setIsPotModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [holeScores, setHoleScores] = useState({});
    const lastHoleRef = useRef(null);
    // --- 1. Add state for the new confirmation modal ---
    const [isConfirmEndGameModalOpen, setIsConfirmEndGameModalOpen] = useState(false);


    useEffect(() => {
        const chipsCollectionRef = collection(db, 'chip-types');
        const unsubscribeChips = onSnapshot(chipsCollectionRef, (snapshot) => {
            const chipsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllChips(chipsData);
        });

        return () => {
            unsubscribeChips();
        };
    }, []);

    useEffect(() => {
        if (!gameId) return;
        const gameDocRef = doc(db, 'games', gameId);
        const unsubscribeGame = onSnapshot(gameDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const gameData = docSnapshot.data();
                setGame({ id: docSnapshot.id, ...gameData });
                if (gameData.status === 'finished') navigate(`/game/${gameId}/over`);
            } else {
                setGame(null);
            }
        });
        return () => unsubscribeGame();
    }, [gameId, navigate]);

    useEffect(() => {
        if (game && game.currentHole !== lastHoleRef.current) {
            const newHoleScores = game.players.reduce((acc, player) => {
                const existingScore = game.scores?.[player.uid]?.[game.currentHole];
                acc[player.uid] = existingScore !== undefined ? existingScore : 0;
                return acc;
            }, {});
            setHoleScores(newHoleScores);
            lastHoleRef.current = game.currentHole;
        }
    }, [game]);

    const handleHostAssignChip = async (playerUid) => {
        if (!selectedChip) return;
        const gameDocRef = doc(db, 'games', gameId);
        const fieldToUpdate = `chipState.${selectedChip}`;
        const assignment = playerUid ? { owner: playerUid, assignedAt: Date.now() } : null;
        await updateDoc(gameDocRef, { [fieldToUpdate]: assignment });
        setIsPotModalOpen(false);
        setSelectedChip(null);
    };

    const handlePlayerTransferChip = async (newOwnerUid) => {
        if (!selectedChip || !auth.currentUser) return;
        const currentOwnerUid = game.chipState?.[selectedChip]?.owner;
        if (auth.currentUser.uid !== currentOwnerUid) {
            alert("You can't reassign a chip you don't own!");
            return;
        }
        const gameDocRef = doc(db, 'games', gameId);
        const fieldToUpdate = `chipState.${selectedChip}`;
        const assignment = { owner: newOwnerUid, assignedAt: Date.now() };
        await updateDoc(gameDocRef, { [fieldToUpdate]: assignment });
        setIsTransferModalOpen(false);
        setSelectedChip(null);
    };

    // --- 2. Create the function the modal will confirm ---
    const confirmEndGame = async () => {
        await updateDoc(doc(db, 'games', gameId), { status: 'finished' });
        setIsConfirmEndGameModalOpen(false); // Close modal on success
    };

    const handleNextHole = async () => {
        const gameDocRef = doc(db, 'games', gameId);
        const updates = {};
        for (const playerUid in holeScores) {
            updates[`scores.${playerUid}.${game.currentHole}`] = holeScores[playerUid];
        }
        const isLastHole = game.currentHole === game.totalHoles;
        updates.status = isLastHole ? 'finished' : game.status;
        updates.currentHole = isLastHole ? game.currentHole : game.currentHole + 1;
        await updateDoc(gameDocRef, updates);
    };

    const handlePreviousHole = async () => {
        if (game.currentHole > 1) {
            const gameDocRef = doc(db, 'games', gameId);
            await updateDoc(gameDocRef, {
                currentHole: game.currentHole - 1
            });
        }
    };

    const adjustScore = (playerUid, amount) => {
        setHoleScores(p => ({ ...p, [playerUid]: (p[playerUid] || 0) + amount }));
    };

    const getChipDetails = (chipName) => {
        return allChips.find(c => c.name === chipName) || { type: 'good', description: 'No description available.' };
    };

    const calculateTotalScore = (playerScores) => {
        return playerScores ? Object.values(playerScores).reduce((t, s) => t + s, 0) : 0;
    };

    if (!game || allChips.length === 0) {
        return (
            <div className="bg-slate-900 text-white min-h-screen flex justify-center items-center">
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                    className="text-3xl font-bold"
                >
                    Loading Game...
                </motion.h1>
            </div>
        );
    }

    const isHost = auth.currentUser.uid === game.host;
    const assignedChipsData = game.chipState || {};
    const allChipNames = allChips.map(c => c.name);
    const chipsInPot = allChipNames.filter(chipName => !assignedChipsData[chipName]);
    const isNextDisabled = game.players.some(p => holeScores[p.uid] === undefined);

    const getPlayerChips = (playerUid) => {
        return Object.entries(assignedChipsData)
            .filter(([, assignment]) => assignment?.owner === playerUid)
            .sort(([, a], [, b]) => b.assignedAt - a.assignedAt)
            .map(([chipName]) => chipName);
    };

    const getPlayerName = (uid) => game.players.find(p => p.uid === uid)?.name || 'Unknown';
    const isLastHole = game.currentHole === game.totalHoles;

    return (
        <>
            <div className="bg-slate-900 text-white min-h-screen flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        {/* ... Omitted scorecard and score entry for brevity ... */}
                        <div className="bg-slate-800 p-6 rounded-lg mb-6">
                            <h2 className="text-2xl font-semibold mb-4 border-b border-slate-700 pb-2">Scorecard</h2>
                            <div className="space-y-3">
                                {game.players.map(player => {
                                    const totalScore = calculateTotalScore(game.scores[player.uid]);
                                    return (
                                        <div key={player.uid} className="flex justify-between items-center">
                                            <span className="font-medium">{player.name}</span>
                                            <span className={`font-bold text-xl ${totalScore > 0 ? 'text-red-400' : totalScore < 0 ? 'text-green-400' : ''}`}>{totalScore > 0 ? `+${totalScore}` : totalScore === 0 ? 'E' : totalScore}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {isHost && (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={game.currentHole}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                >
                                    <div className="bg-slate-800 p-6 rounded-lg mb-6">
                                        <h2 className="text-2xl font-semibold mb-2">Enter Scores for Hole {game.currentHole} / {game.totalHoles}</h2>
                                        <p className="text-slate-400 mb-4">Score against par on hole.</p>
                                        <div className="space-y-4">
                                            {game.players.map((player) => (
                                                <div key={player.uid} className="flex justify-between items-center bg-slate-700 p-3 rounded-lg">
                                                    <span className="font-semibold text-lg">{player.name}</span>
                                                    <div className="flex items-center gap-4">
                                                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => adjustScore(player.uid, -1)} className="w-8 h-8 bg-slate-600 rounded-full text-xl font-bold flex items-center justify-center">-</motion.button>
                                                        <div className="relative w-8 h-8 text-center flex items-center justify-center">
                                                            <AnimatePresence mode="popLayout">
                                                                <motion.span
                                                                    key={holeScores[player.uid] || 0}
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: 10 }}
                                                                    transition={{ duration: 0.15 }}
                                                                    className="absolute text-2xl font-bold"
                                                                >
                                                                    {holeScores[player.uid] > 0 ? `+${holeScores[player.uid]}` : holeScores[player.uid] || 0}
                                                                </motion.span>
                                                            </AnimatePresence>
                                                        </div>
                                                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => adjustScore(player.uid, 1)} className="w-8 h-8 bg-slate-600 rounded-full text-xl font-bold flex items-center justify-center">+</motion.button>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex space-x-4">
                                                <button
                                                    onClick={handlePreviousHole}
                                                    disabled={game.currentHole === 1}
                                                    className={`flex-1 bg-slate-500 hover:bg-slate-600 rounded-md p-3 font-bold transition-colors ${game.currentHole === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    Previous
                                                </button>
                                                <button
                                                    onClick={handleNextHole}
                                                    disabled={isNextDisabled}
                                                    className={`flex-1 bg-green-600 rounded-md p-3 font-bold transition ${isNextDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-500'}`}
                                                >
                                                    {isLastHole ? 'Save & Finish Game' : 'Save & Advance'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        )}

                        <div className="bg-slate-800 p-6 rounded-lg mb-6">
                            <h2 className="text-2xl font-semibold mb-4">My Chips ({getPlayerChips(auth.currentUser.uid).length})</h2>
                            {getPlayerChips(auth.currentUser.uid).length > 0 ? (
                                <div className="flex flex-wrap justify-center gap-4">
                                    <AnimatePresence>
                                        {getPlayerChips(auth.currentUser.uid).map((chipName) => {
                                            const chipDetails = getChipDetails(chipName);
                                            return (
                                                <motion.div
                                                    key={chipName}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                >
                                                    <Chip
                                                        chipName={chipName}
                                                        owner={getPlayerName(auth.currentUser.uid)}
                                                        chipType={chipDetails.type}
                                                        onClick={() => { setSelectedChip(chipName); setIsTransferModalOpen(true); }}
                                                        onLongPress={() => setChipForDescription(chipDetails)}
                                                    />
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            ) : <p className="text-slate-400">You are not currently holding any chips.</p>}
                        </div>


                        {isHost && (
                            <div className="text-center space-x-4">
                                <button onClick={() => setIsPotModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-700 rounded-lg px-6 py-3 font-semibold transition-colors">Chip Bag</button>
                                {/* --- 3. Update the button's onClick handler --- */}
                                <button onClick={() => setIsConfirmEndGameModalOpen(true)} className="bg-red-600 hover:bg-red-700 rounded-lg px-6 py-3 font-semibold transition-colors">End Game</button>
                            </div>
                        )}
                        <div className="h-24"></div>
                    </div>
                </div>

                <div className="fixed inset-x-0 bottom-0 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 z-10">
                    <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
                        <span className="text-slate-400 text-sm sm:text-base">Share this Room Code:</span>
                        <span className="text-xl sm:text-2xl font-bold text-yellow-400 tracking-widest">{game.roomCode}</span>
                    </div>
                </div>

                {/* ... Omitted other modals for brevity ... */}
                <AnimatePresence>
                    {isPotModalOpen && (
                        <Modal onClose={() => { setIsPotModalOpen(false); setSelectedChip(null); }} title={selectedChip ? `Assign ${selectedChip}` : "Chips in the Bag"}>
                            {!selectedChip ? (
                                <div className="max-h-[60vh] overflow-y-auto p-2">
                                    <motion.div
                                        className="grid grid-cols-2 sm:grid-cols-3 gap-4 place-items-center"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {chipsInPot.map((chipName) => {
                                            const chipDetails = getChipDetails(chipName);
                                            return (
                                                <motion.div key={chipName} variants={itemVariants}>
                                                    <Chip chipName={chipName} owner={null} chipType={chipDetails.type} onClick={() => setSelectedChip(chipName)} onLongPress={() => setChipForDescription(chipDetails)} />
                                                </motion.div>
                                            )
                                        })}
                                        {chipsInPot.length === 0 && <p className="col-span-full text-slate-400">All chips have been handed out.</p>}
                                    </motion.div>
                                </div>
                            ) : (
                                <motion.div
                                    className="flex flex-col space-y-2"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <p className="text-slate-400 mb-2">Who is holding this chip now?</p>
                                    {game.players.map((player) => (
                                        <motion.button key={player.uid} variants={itemVariants} onClick={() => handleHostAssignChip(player.uid)} className="bg-cyan-600 w-full text-left hover:bg-cyan-700 rounded-md px-4 py-3 font-semibold transition-colors">{player.name}</motion.button>
                                    ))}
                                    <motion.button variants={itemVariants} onClick={() => handleHostAssignChip(null)} className="bg-slate-500 w-full text-left hover:bg-slate-600 rounded-md px-4 py-3 font-semibold transition-colors">Unclaim (Return to Pot)</motion.button>
                                </motion.div>
                            )}
                        </Modal>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isTransferModalOpen && (
                        <Modal onClose={() => setIsTransferModalOpen(false)} title={`Transfer ${selectedChip}`}>
                            <motion.div
                                className="flex flex-col space-y-2"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <p className="text-slate-400 mb-2">Who are you giving this chip to?</p>
                                {game.players.filter(p => p.uid !== auth.currentUser.uid).map((player) => (
                                    <motion.button key={player.uid} variants={itemVariants} onClick={() => handlePlayerTransferChip(player.uid)} className="bg-cyan-600 w-full text-left hover:bg-cyan-700 rounded-md px-4 py-3 font-semibold transition-colors">{player.name}</motion.button>
                                ))}
                            </motion.div>
                        </Modal>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {!!chipForDescription && (
                        <Modal onClose={() => setChipForDescription(null)} title={chipForDescription?.name}>
                            {chipForDescription && <div className="max-h-[60vh] overflow-y-auto pr-2 text-slate-300"><p>{chipForDescription.description}</p></div>}
                        </Modal>
                    )}
                </AnimatePresence>

                {/* --- 4. Add the new modal JSX --- */}
                <AnimatePresence>
                    {isConfirmEndGameModalOpen && (
                        <Modal onClose={() => setIsConfirmEndGameModalOpen(false)} title="Confirm End Game">
                            <div className="flex flex-col space-y-4">
                                <p className="text-slate-300">Are you sure you want to end the game for everyone? This action cannot be undone.</p>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setIsConfirmEndGameModalOpen(false)}
                                        className="bg-slate-500 hover:bg-slate-600 rounded-md px-4 py-2 font-semibold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmEndGame}
                                        className="bg-red-600 hover:bg-red-700 rounded-md px-4 py-2 font-semibold transition-colors"
                                    >
                                        End Game
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    )}
                </AnimatePresence>

            </div>
        </>
    );
};

export default GameScreen;