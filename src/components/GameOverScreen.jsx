// src/components/GameOverScreen.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from './Modal';

const GameOverScreen = () => {
    const { gameId } = useParams();
    const [scores, setScores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedChip, setSelectedChip] = useState(null);
    const [chipDetails, setChipDetails] = useState({});

    useEffect(() => {
        const calculateScores = async () => {
            try {
                const gameDocRef = doc(db, 'games', gameId);
                const gameDocSnap = await getDoc(gameDocRef);

                if (!gameDocSnap.exists()) {
                    throw new Error("Game not found.");
                }
                const gameData = gameDocSnap.data();
                const players = gameData.players || [];
                const gameScores = gameData.scores || {};
                const chipState = gameData.chipState || {};

                const chipsCollectionRef = collection(db, 'chip-types');
                const chipsSnapshot = await getDocs(chipsCollectionRef);
                const details = {};
                chipsSnapshot.forEach(doc => {
                    const data = doc.data();
                    details[data.name] = data;
                });
                setChipDetails(details);

                const chipScores = players.reduce((acc, player) => ({ ...acc, [player.uid]: 0 }), {});
                const playerChips = players.reduce((acc, player) => ({ ...acc, [player.uid]: [] }), {});

                // --- CHANGE IS HERE: Read the new chipState structure ---
                for (const [chipName, assignment] of Object.entries(chipState)) {
                    if (assignment && assignment.owner && Object.prototype.hasOwnProperty.call(chipScores, assignment.owner)) {
                        const ownerUid = assignment.owner;
                        const type = details[chipName]?.type;
                        playerChips[ownerUid].push(chipName);

                        if (type === 'good') chipScores[ownerUid]--;
                        else if (type === 'bad') chipScores[ownerUid]++;
                    }
                }

                const golfScores = players.reduce((acc, player) => {
                    const totalScore = Object.values(gameScores[player.uid] || {}).reduce((sum, score) => sum + score, 0);
                    acc[player.uid] = totalScore;
                    return acc;
                }, {});

                const finalScores = players.map(player => {
                    const golfScore = golfScores[player.uid];
                    const chipScore = chipScores[player.uid];
                    const totalScore = golfScore + chipScore;
                    return {
                        name: player.name,
                        golfScore,
                        chipScore,
                        totalScore,
                        chips: playerChips[player.uid]
                    };
                });

                const sortedScores = finalScores.sort((a, b) => a.totalScore - b.totalScore);
                setScores(sortedScores);

            } catch (err) {
                console.error("Error calculating scores:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        calculateScores();
    }, [gameId]);

    if (isLoading) {
        return <div className="bg-slate-900 text-white min-h-screen flex justify-center items-center"><h1 className="text-3xl font-bold">Calculating Scores...</h1></div>;
    }

    if (error) {
        return <div className="bg-slate-900 text-white min-h-screen flex justify-center items-center"><h1 className="text-xl font-bold text-red-500">Error: {error}</h1></div>;
    }

    const formatScore = (score, isChipScore = false) => {
        if (score > 0) return `+${score}`;
        if (score === 0) return isChipScore ? '0' : 'E';
        return score;
    };

    return (
        <>
            <div className="bg-slate-900 text-white min-h-screen flex flex-col justify-center items-center p-4">
                <h1 className="text-5xl font-bold text-cyan-400 mb-4">Game Over!</h1>
                <p className="text-slate-400 mb-10">Here are the final scores:</p>

                <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-lg p-6">
                    <ul className="space-y-4">
                        {scores.map(({ name, golfScore, chipScore, totalScore, chips }, index) => (
                            <li key={name} className="bg-slate-700 p-4 rounded-md">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center">
                                        <span className="text-xl font-bold text-slate-400 w-8">{index + 1}.</span>
                                        <span className="text-xl font-semibold">{name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-slate-400 block">TOTAL</span>
                                        <span className={`text-2xl font-bold ${totalScore > 0 ? 'text-red-400' : totalScore < 0 ? 'text-green-400' : 'text-white'}`}>
                                            {formatScore(totalScore)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-end items-center text-sm text-slate-400 border-t border-slate-600 pt-2 mt-2">
                                    <span>Golf: {formatScore(golfScore)}</span>
                                    <span className="mx-2">|</span>
                                    <span>Chips: {formatScore(chipScore, true)}</span>
                                </div>
                                {chips.length > 0 && (
                                    <div className="border-t border-slate-600 pt-3 mt-3">
                                        <div className="flex flex-wrap gap-2">
                                            {chips.map(chipName => (
                                                <button
                                                    key={chipName}
                                                    onClick={() => setSelectedChip({ name: chipName, description: chipDetails[chipName]?.description })}
                                                    className="bg-slate-600 text-xs text-white px-2 py-1 rounded-full hover:bg-slate-500 transition"
                                                >
                                                    {chipName}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <Link to="/" className="mt-10 bg-cyan-600 hover:bg-cyan-500 rounded-lg px-6 py-3 font-semibold transition-colors">
                    Play Again
                </Link>
            </div>

            <Modal isOpen={!!selectedChip} onClose={() => setSelectedChip(null)} title={selectedChip?.name}>
                {selectedChip && (
                    <div className="max-h-[60vh] overflow-y-auto pr-2 text-slate-300">
                        <p>{selectedChip.description || "No description available."}</p>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default GameOverScreen;
