// src/components/GameScreen.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';
import Chip from './Chip';
import Modal from './Modal';
import { AnimatePresence } from 'framer-motion';

const GameScreen = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [allChips, setAllChips] = useState([]);
    const [selectedChip, setSelectedChip] = useState(null);
    const [chipForDescription, setChipForDescription] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isPotModalOpen, setIsPotModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [holeScores, setHoleScores] = useState({});
    const lastHoleRef = useRef(null);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged(user => {
            if (user) setCurrentUser(user);
            else navigate('/');
        });

        const chipsCollectionRef = collection(db, 'chip-types');
        const unsubscribeChips = onSnapshot(chipsCollectionRef, (snapshot) => {
            const chipsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllChips(chipsData);
        });

        return () => {
            unsubscribeAuth();
            unsubscribeChips();
        };
    }, [navigate]);

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
            const initialScores = game.players.reduce((acc, player) => {
                acc[player.uid] = 0;
                return acc;
            }, {});
            setHoleScores(initialScores);
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
        if (!selectedChip || !currentUser) return;
        const currentOwnerUid = game.chipState?.[selectedChip]?.owner;
        if (currentUser.uid !== currentOwnerUid) {
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

    const handleEndGame = async () => {
        if (window.confirm("Are you sure you want to end the game for everyone?")) {
            await updateDoc(doc(db, 'games', gameId), { status: 'finished' });
        }
    };

    const handleSaveScores = async () => {
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

    const adjustScore = (playerUid, amount) => {
        setHoleScores(p => ({ ...p, [playerUid]: (p[playerUid] || 0) + amount }));
    };

    const getChipDetails = (chipName) => {
        return allChips.find(c => c.name === chipName) || { type: 'good', description: 'No description available.' };
    };

    const calculateTotalScore = (playerScores) => {
        return playerScores ? Object.values(playerScores).reduce((t, s) => t + s, 0) : 0;
    };

    if (!game || !currentUser || allChips.length === 0) {
        return <div className="bg-slate-900 text-white min-h-screen flex justify-center items-center"><h1 className="text-3xl font-bold">Loading Game...</h1></div>;
    }

    const isHost = currentUser.uid === game.host;
    const assignedChipsData = game.chipState || {};
    const allChipNames = allChips.map(c => c.name);
    const chipsInPot = allChipNames.filter(chipName => !assignedChipsData[chipName]);

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
            <div className="bg-slate-900 text-white min-h-screen p-4 md:p-8 pb-24">
                <div className="max-w-4xl mx-auto">
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
                        <div className="bg-slate-800 p-6 rounded-lg mb-6">
                            <h2 className="text-2xl font-semibold mb-4">Enter Scores for Hole {game.currentHole} / {game.totalHoles}</h2>
                            <div className="space-y-4">
                                {game.players.map((player) => (
                                    <div key={player.uid} className="flex justify-between items-center bg-slate-700 p-3 rounded-lg">
                                        <span className="font-semibold text-lg">{player.name}</span>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => adjustScore(player.uid, -1)} className="w-8 h-8 bg-slate-600 rounded-full text-xl font-bold flex items-center justify-center">-</button>
                                            <span className="text-2xl font-bold w-8 text-center">{holeScores[player.uid] || 0}</span>
                                            <button onClick={() => adjustScore(player.uid, 1)} className="w-8 h-8 bg-slate-600 rounded-full text-xl font-bold flex items-center justify-center">+</button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={handleSaveScores} className="w-full bg-green-600 hover:bg-green-500 rounded-md p-3 font-bold transition">{isLastHole ? 'Save & Finish Game' : 'Save & Advance to Next Hole'}</button>
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-800 p-6 rounded-lg mb-6">
                        <h2 className="text-2xl font-semibold mb-4">My Chips ({getPlayerChips(currentUser.uid).length})</h2>
                        {getPlayerChips(currentUser.uid).length > 0 ? (
                            <div className="flex flex-wrap justify-center gap-4">
                                <AnimatePresence>
                                    {getPlayerChips(currentUser.uid).map((chipName) => {
                                        const chipDetails = getChipDetails(chipName);
                                        return (
                                            <div
                                                key={chipName}
                                            >
                                                <Chip
                                                    chipName={chipName}
                                                    owner={getPlayerName(currentUser.uid)}
                                                    chipType={chipDetails.type}
                                                    onClick={() => { setSelectedChip(chipName); setIsTransferModalOpen(true); }}
                                                    onLongPress={() => setChipForDescription(chipDetails)}
                                                />
                                            </div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        ) : <p className="text-slate-400">You are not currently holding any chips.</p>}
                    </div>

                    {isHost && (
                        <div className="text-center space-x-4">
                            <button onClick={() => setIsPotModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-700 rounded-lg px-6 py-3 font-semibold transition-colors">Manage Pot</button>
                            <button onClick={handleEndGame} className="bg-red-600 hover:bg-red-700 rounded-lg px-6 py-3 font-semibold transition-colors">End Game</button>
                        </div>
                    )}
                </div>

                <div className="fixed inset-x-0 bottom-0 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 z-10">
                    <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
                        <span className="text-slate-400 text-sm sm:text-base">Share this Room Code:</span>
                        <span className="text-xl sm:text-2xl font-bold text-yellow-400 tracking-widest">{game.roomCode}</span>
                    </div>
                </div>

                <Modal isOpen={isPotModalOpen} onClose={() => { setIsPotModalOpen(false); setSelectedChip(null); }} title={selectedChip ? `Assign ${selectedChip}` : "Chips in the Pot"}>
                    {!selectedChip ? (
                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 place-items-center">
                                {chipsInPot.map((chipName) => {
                                    const chipDetails = getChipDetails(chipName);
                                    return <Chip key={chipName} chipName={chipName} owner={null} chipType={chipDetails.type} onClick={() => setSelectedChip(chipName)} onLongPress={() => setChipForDescription(chipDetails)} />
                                })}
                                {chipsInPot.length === 0 && <p className="col-span-full text-slate-400">All chips have been handed out.</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-2">
                            <p className="text-slate-400 mb-2">Who is holding this chip now?</p>
                            {game.players.map((player) => (
                                <button key={player.uid} onClick={() => handleHostAssignChip(player.uid)} className="bg-cyan-600 w-full text-left hover:bg-cyan-700 rounded-md px-4 py-3 font-semibold transition-colors">{player.name}</button>
                            ))}
                            <button onClick={() => handleHostAssignChip(null)} className="bg-slate-500 w-full text-left hover:bg-slate-600 rounded-md px-4 py-3 font-semibold transition-colors">Unclaim (Return to Pot)</button>
                        </div>
                    )}
                </Modal>

                <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title={`Transfer ${selectedChip}`}>
                    <div className="flex flex-col space-y-2">
                        <p className="text-slate-400 mb-2">Who are you giving this chip to?</p>
                        {game.players.filter(p => p.uid !== currentUser.uid).map((player) => (
                            <button key={player.uid} onClick={() => handlePlayerTransferChip(player.uid)} className="bg-cyan-600 w-full text-left hover:bg-cyan-700 rounded-md px-4 py-3 font-semibold transition-colors">{player.name}</button>
                        ))}
                    </div>
                </Modal>

                <Modal isOpen={!!chipForDescription} onClose={() => setChipForDescription(null)} title={chipForDescription?.name}>
                    {chipForDescription && <div className="max-h-[60vh] overflow-y-auto pr-2 text-slate-300"><p>{chipForDescription.description}</p></div>}
                </Modal>
            </div>
        </>
    );
};

export default GameScreen;