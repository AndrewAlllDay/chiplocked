// src/components/HomeScreen.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, updateDoc, arrayUnion, doc } from "firebase/firestore";
import { db, auth } from '../firebase'; // Import auth
import { motion } from 'framer-motion';

// Import the two new image assets for the logo
import greenCircleImage from '../assets/images/green-circle.png';
import cImage from '../assets/images/c.png';

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
    const [totalHoles, setTotalHoles] = useState(9);

    const [showDashboardButton, setShowDashboardButton] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [tapCount, setTapCount] = useState(0);
    const [lastTapTime, setLastTapTime] = useState(0);

    const handleCreateGame = async (e) => {
        e.preventDefault();
        if (!name) return;

        const user = auth.currentUser;
        if (!user) {
            alert("Could not verify user. Please refresh and try again.");
            return;
        }

        localStorage.setItem('playerName', name);

        try {
            const newRoomCode = generateRoomCode();
            const initialScores = { [user.uid]: {} };

            const gameDocRef = await addDoc(collection(db, "games"), {
                roomCode: newRoomCode,
                players: [{ uid: user.uid, name: name }],
                host: user.uid,
                chipState: {},
                createdAt: new Date(),
                status: 'active',
                currentHole: 1,
                scores: initialScores,
                totalHoles: totalHoles,
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

        const user = auth.currentUser;
        if (!user) {
            alert("Could not verify user. Please refresh and try again.");
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
                const newPlayerScoreField = `scores.${user.uid}`;

                await updateDoc(doc(db, "games", gameDoc.id), {
                    players: arrayUnion({ uid: user.uid, name: name }),
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

    const handleSecretTap = () => {
        const currentTime = new Date().getTime();
        if (currentTime - lastTapTime < 500) {
            setTapCount(prevCount => {
                const newCount = prevCount + 1;
                if (newCount === 3) {
                    setShowDashboardButton(true);
                }
                return newCount;
            });
        } else {
            setTapCount(1);
        }
        setLastTapTime(currentTime);
    };

    return (
        <div className="bg-slate-900 text-white min-h-screen flex flex-col justify-center items-center p-4 overflow-hidden">
            <div
                className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32"
                onClick={handleSecretTap}
            ></div>

            {showDashboardButton && (
                <div className="absolute top-4 right-4 z-10">
                    <Link to="/dashboard" className="text-sm bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition">
                        Chip Dashboard
                    </Link>
                </div>
            )}

            <div className="w-full max-w-sm flex flex-col items-center">
                {/* Logo and title section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-[150px] h-[150px] flex justify-center items-center">
                        {/* Green circle fades in first */}
                        <motion.img
                            src={greenCircleImage}
                            alt="Green Circle Background"
                            className="w-full h-full object-contain"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.7 }}
                        />
                        {/* 'c' image loads and spins after a delay */}
                        <motion.img
                            src={cImage}
                            alt="Letter C"
                            className="absolute w-[120px] h-[120px] object-contain"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                rotate: 0
                            }}
                            transition={{
                                scale: { delay: 0.7, duration: 0.5 }, // Fade in after a delay
                                opacity: { delay: 0.7, duration: 0.5 },
                                rotate: { from: -180, delay: 1.2, duration: 1, ease: "easeInOut" } // Rotate after fade in
                            }}
                        />
                    </div>
                    <div className="text-center">
                        <h1 className="text-5xl font-bold text-cyan-400">ChipLocked</h1>
                        <p className="text-slate-400">The ultimate disc golf side-game tracker</p>
                    </div>
                </div>

                <div className="w-full max-w-sm">
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
                                <form onSubmit={handleCreateGame} className="p-6 pt-6 space-y-4">
                                    <InputField
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        maxLength="12"
                                    />
                                    <div>
                                        <p className="text-center text-slate-400 mb-2">How many holes?</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button type="button" onClick={() => setTotalHoles(9)} className={`p-3 rounded-md font-bold transition ${totalHoles === 9 ? 'bg-secondary' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                                9 Holes
                                            </button>
                                            <button type="button" onClick={() => setTotalHoles(18)} className={`p-3 rounded-md font-bold transition ${totalHoles === 18 ? 'bg-secondary' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                                18 Holes
                                            </button>
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-secondary rounded-md p-3 font-bold transition">
                                        Create and Go
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="h-6"></div>

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
                                <form onSubmit={handleJoinGame} className="p-6 pt-6 space-y-4">
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
                                    <button type="submit" className="w-full bg-secondary rounded-md p-3 font-bold transition">
                                        Join and Go
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;
