// src/components/GameOverScreen.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const GameOverScreen = () => {
    const { gameId } = useParams();
    const [scores, setScores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const calculateScores = async () => {
            try {
                // 1. Get all game data
                const gameDocRef = doc(db, 'games', gameId);
                const gameDocSnap = await getDoc(gameDocRef);

                if (!gameDocSnap.exists()) {
                    throw new Error("Game not found.");
                }
                const gameData = gameDocSnap.data();
                const players = gameData.players || [];
                const gameScores = gameData.scores || {};
                const chipState = gameData.chipState || {};

                // 2. Get all chip types (good/bad)
                const chipsCollectionRef = collection(db, 'chip-types');
                const chipsSnapshot = await getDocs(chipsCollectionRef);
                const chipTypes = {};
                chipsSnapshot.forEach(doc => {
                    chipTypes[doc.data().name] = doc.data().type;
                });

                // 3. Calculate chip score for each player
                const chipScores = players.reduce((acc, player) => ({ ...acc, [player]: 0 }), {});
                for (const [chipName, owner] of Object.entries(chipState)) {
                    if (owner && chipScores.hasOwnProperty(owner)) {
                        const type = chipTypes[chipName];
                        // --- CHANGE IS HERE ---
                        // Good chips are -1, bad chips are +1
                        if (type === 'good') chipScores[owner]--;
                        else if (type === 'bad') chipScores[owner]++;
                    }
                }

                // 4. Calculate golf score for each player
                const golfScores = players.reduce((acc, player) => {
                    const totalScore = Object.values(gameScores[player] || {}).reduce((sum, score) => sum + score, 0);
                    acc[player] = totalScore;
                    return acc;
                }, {});

                // 5. Combine scores and sort
                const finalScores = players.map(player => {
                    const golfScore = golfScores[player];
                    const chipScore = chipScores[player];
                    // --- AND CHANGE IS HERE ---
                    // Add the chip score modifier to the golf score
                    const totalScore = golfScore + chipScore;
                    return { name: player, golfScore, chipScore, totalScore };
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

    // Helper to format scores for display
    const formatScore = (score, isChipScore = false) => {
        if (score > 0) return `+${score}`;
        if (score === 0) return isChipScore ? '0' : 'E';
        return score;
    };

    return (
        <div className="bg-slate-900 text-white min-h-screen flex flex-col justify-center items-center p-4">
            <h1 className="text-5xl font-bold text-cyan-400 mb-4">Game Over!</h1>
            <p className="text-slate-400 mb-10">Here are the final scores:</p>

            <div className="w-full max-w-md bg-slate-800 rounded-lg shadow-lg p-6">
                <ul className="space-y-4">
                    {scores.map(({ name, golfScore, chipScore, totalScore }, index) => (
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
                        </li>
                    ))}
                </ul>
            </div>

            <Link to="/" className="mt-10 bg-cyan-600 hover:bg-cyan-500 rounded-lg px-6 py-3 font-semibold transition-colors">
                Play Again
            </Link>
        </div>
    );
};

export default GameOverScreen;
