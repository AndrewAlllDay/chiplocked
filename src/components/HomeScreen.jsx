// src/components/HomeScreen.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from '../firebase';

const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const InputField = ({ value, onChange, placeholder, ...props }) => (
    <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-700 border-2 border-slate-600 rounded-md p-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition"
        {...props}
    />
);

const HomeScreen = () => {
    const navigate = useNavigate();

    const [activeForm, setActiveForm] = useState(null);
    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [totalHoles, setTotalHoles] = useState(9); // State for number of holes

    const handleCreateGame = async (e) => {
        e.preventDefault();
        if (!name) return;

        localStorage.setItem('playerName', name);

        try {
            const newRoomCode = generateRoomCode();
            const initialScores = { [name]: {} };

            const gameDocRef = await addDoc(collection(db, "games"), {
                roomCode: newRoomCode,
                players: [name],
                host: name,
                chipState: {},
                createdAt: new Date(),
                status: 'active',
                currentHole: 1,
                scores: initialScores,
                totalHoles: totalHoles, // Add totalHoles to the game document
            });
            navigate(`/game/${gameDocRef.id}`);
        } catch (err) {
            console.error("Error creating game: ", err);
        }
    };

    const handleJoinGame = async (e) => {
        e.preventDefault();
        if (!roomCode || roomCode.length !== 6 || !name) {
            alert("Please enter a valid name and 6-character room code.");
            return;
        }

        localStorage.setItem('playerName', name);

        try {
            const gamesRef = collection(db, "games");
            const q = query(gamesRef, where("roomCode", "==", roomCode.toUpperCase()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                alert("Game not found! Please check the room code.");
            } else {
                const gameDoc = querySnapshot.docs[0];
                const newPlayerScoreField = `scores.${name}`;
                await updateDoc(gameDoc.ref, {
                    players: arrayUnion(name),
                    [newPlayerScoreField]: {}
                });
                navigate(`/game/${gameDoc.id}`);
            }
        } catch (err) {
            console.error("Error joining game: ", err);
        }
    };

    const toggleForm = (formType) => {
        if (activeForm === formType) {
            setActiveForm(null);
        } else {
            setActiveForm(formType);
            setName('');
            setRoomCode('');
        }
    };

    return (
        <div className="bg-slate-900 text-white min-h-screen flex flex-col justify-center items-center p-4">
            <div className="absolute top-4 right-4">
                <Link to="/dashboard" className="text-sm bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition">
                    Chip Dashboard
                </Link>
            </div>

            <h1 className="text-5xl font-bold text-cyan-400 mb-2">Chip-locked</h1>
            <p className="text-slate-400 mb-12">The ultimate disc golf side-game tracker</p>

            <div className="w-full max-w-sm">
                {/* === CREATE GAME SECTION === */}
                <div className="bg-slate-800 rounded-lg overflow-hidden">
                    <div
                        onClick={() => toggleForm('create')}
                        className="p-6 text-center cursor-pointer hover:bg-slate-700 transition-colors"
                    >
                        <h2 className="text-2xl font-semibold mb-2">Create Game</h2>
                        <p className="text-slate-400">Start a new game and invite your friends.</p>
                    </div>
                    <div className={`transition-all duration-300 ease-in-out grid ${activeForm === 'create' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                            <form onSubmit={handleCreateGame} className="p-6 pt-4 space-y-4">
                                <InputField
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    maxLength="12"
                                />
                                {/* --- HOLE SELECTION UI --- */}
                                <div>
                                    <p className="text-center text-slate-400 mb-2">How many holes?</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button type="button" onClick={() => setTotalHoles(9)} className={`p-3 rounded-md font-bold transition ${totalHoles === 9 ? 'bg-cyan-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                            9 Holes
                                        </button>
                                        <button type="button" onClick={() => setTotalHoles(18)} className={`p-3 rounded-md font-bold transition ${totalHoles === 18 ? 'bg-cyan-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                            18 Holes
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 rounded-md p-3 font-bold transition">
                                    Create and Go
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Spacer */}
                <div className="h-6"></div>

                {/* === JOIN GAME SECTION === */}
                <div className="bg-slate-800 rounded-lg overflow-hidden">
                    <div
                        onClick={() => toggleForm('join')}
                        className="p-6 text-center cursor-pointer hover:bg-slate-700 transition-colors"
                    >
                        <h2 className="text-2xl font-semibold mb-2">Join Game</h2>
                        <p className="text-slate-400">Join an existing game with a room code.</p>
                    </div>
                    <div className={`transition-all duration-300 ease-in-out grid ${activeForm === 'join' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                            <form onSubmit={handleJoinGame} className="p-6 !pt-5 space-y-4">
                                <InputField
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    maxLength="12"
                                />
                                <InputField
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value)}
                                    placeholder="Enter 6-character room code"
                                    maxLength="6"
                                    style={{ textTransform: 'uppercase' }}
                                />
                                <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 rounded-md p-3 font-bold transition">
                                    Join and Go
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;
