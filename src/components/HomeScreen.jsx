// src/components/HomeScreen.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, updateDoc, arrayUnion, doc } from "firebase/firestore";
import { db, auth } from '../firebase'; // Import auth
import { motion } from 'framer-motion';



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
        <div className="bg-slate-900 text-white min-h-screen flex flex-col justify-center items-center p-4 **overflow-hidden**">
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
                <div className="text-center mb-8">
                    <motion.svg
                        width="150"
                        height="150"
                        viewBox="0 0 339.97 340.14"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ display: 'inline-block' }}
                    >
                        <motion.path
                            fill="#74bb76"
                            d="M154.66.47C37.73,8.8-31.35,132.74,14.1,239.16c57.5,134.63,254.02,134.62,311.45,0C376.82,118.98,284.64-8.78,154.66.47Z"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.7 }}
                        />
                        <motion.g
                            initial={{ opacity: 0, rotate: -180 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            transition={{
                                delay: 0.5,
                                type: "spring",
                                stiffness: 120,
                                damping: 30,
                            }}
                        >
                            <motion.path
                                fill="#110d19"
                                d="M227.36,28.44c.28.1.44,1.3,1.1,1.56,13.39,5.24,25.16,11.2,36.57,20.06,3.15,6.8,1.83,16.48-2.04,22.84s-22.01,26.77-27.94,32.88c-13.08,13.47-23.18,1.38-36.09-2.61-5.84-1.81-10.06-1.86-14.86-4.27-5.83-2.92-24.33,1.48-30.76,3.94-16.8,6.45-37.25,23.96-43.51,41.25-5.74,15.85-4.73,40.03,2.97,55.21,15.73,30.98,54.29,47.33,87.2,33.97,9.88-4.01,16.05-11.14,28.08-9.65,9.37,1.16,12.16,8.43,17.88,14.52,7.73,8.24,23.29,22,23.61,33.81.05,1.97-.63,8.91-1.06,10.69-.38,1.61-12.62,9.63-15.01,11.1-14.84,9.13-31.61,16.15-48.52,20.28-31.5,7.68-65.99,3.83-96.65-9.55C24.65,267.94-1.71,164.76,43.77,88.01,80.32,26.34,161.52,4.2,227.36,28.44ZM126.3,221.19c-57.77-54.02,1.31-147.21,74.41-120.78,9.96,3.6,20.65,13.84,31.35,4.38,10.3-9.11,19.71-25.87,30.36-35.45,2.55-5.37,3.47-14.18-.93-18.75-6.08-6.31-28.86-17.14-37.58-20.25C107.42-11.24-3.71,91.61,30.52,210.78c27.21,94.73,141.51,133.62,222.98,79.98,9.26-6.1,16.44-9.88,13.81-22.62-1.71-8.28-24.46-26.74-29.17-35.64-13.2-16.6-28.43,1.05-43.38,5.51-23.39,6.99-50.75-.25-68.46-16.81h0Z"
                            />
                            <motion.path
                                fill="#f9f8fa"
                                d="M186.46,103.22c.36.15.5,1.38,1.04,1.63,8.96,4.29,12.5,6.19,17.77,14.94,7.93,13.18,7.32,27.9-2.12,40.84-1.64,2.25-6.99,5.69-6.29,8.36l29.86,33.05c4.45,7.51-11.36,19.46-17.08,22.91-18.93,11.4-47.42,11.9-66.65,1-5.36-3.04-20.42-14.42-20.01-20.79.34-5.3,27.56-30.78,31.88-36.99l.02-1.45c-19.6-12.6-19.77-43.29-1.47-57.83,8.01-6.36,23.58-9.57,33.06-5.67h-.01ZM202.15,182.24c-1.96-2.22-12.41-13.45-12.42-15.04,2.64-4.28,7.73-6.6,10.85-11.13,11.77-17.11,4.62-42.9-15.77-48.72-33.35-9.52-54.41,30.75-28.95,54.88,1.87,1.78,5.51,2.55,4.85,5.72-.62,3.01-24.63,27.22-28.74,32.18-.7.84-3.77,4.7-3.85,5.11-.54,2.69,9.54,11.66,12.07,13.54,24.68,18.28,66.8,13.86,82.48-13.72-6.03-8-13.8-15.23-20.51-22.83h-.01Z"
                            />
                            <motion.path
                                fill="#f9f8fa"
                                d="M126.3,221.19c17.72,16.56,45.07,23.8,68.46,16.81,14.95-4.46,30.17-22.11,43.38-5.51,4.71,8.9,27.46,27.36,29.17,35.64,2.62,12.74-4.55,16.52-13.81,22.62-81.47,53.64-195.76,14.75-222.98-79.98C-3.71,91.61,107.42-11.24,223.91,30.35c8.73,3.11,31.5,13.94,37.58,20.25,4.4,4.57,3.48,13.38.93,18.75-10.65,9.58-20.06,26.34-30.36,35.45-10.69,9.46-21.39-.78-31.35-4.38-73.1-26.43-132.18,66.76-74.41,120.78h0ZM161.65,26.4C49.25,34.71-9.26,162.43,57.73,253.37c43.43,58.96,129.77,74.01,191.19,33.82,6.24-4.08,17.13-10.42,12.41-19.05-9.83-9.95-18.48-22.84-28.17-32.64-10.85-10.97-17.59.34-29.05,4.87-48.4,19.16-102.44-14.13-106.06-66.2-3.85-55.44,48.16-95.14,100.91-79.97,7.53,2.17,19.83,11.29,26.69,8.17,11.61-12.65,23.64-25.36,33.47-39.35,2.29-7.13-5.6-11.13-10.6-14.39-24.46-15.95-57.71-24.37-86.87-22.22h0Z"
                            />
                            <motion.path
                                fill="#110d19"
                                d="M202.15,182.24c6.7,7.59,14.47,14.83,20.51,22.83-15.67,27.58-57.8,32-82.48,13.72-2.54-1.88-12.61-10.85-12.07-13.54.08-.4,3.16-4.27,3.85-5.11,4.11-4.96,28.12-29.17,28.74-32.18.66-3.17-2.98-3.95-4.85-5.72-25.46-24.13-4.4-64.39,28.95-54.88,20.39,5.82,27.54,31.6,15.77,48.72-3.11,4.53-8.21,6.85-10.85,11.13,0,1.59,10.46,12.82,12.42,15.04h.01Z"
                            />
                            <motion.path
                                fill="#110d19"
                                d="M161.65,26.4c33.2-2.61,70.73,7.95,95.68,30.1l-34.3,39.24c-58.65-34.37-133.24,4.66-127.97,75.43,4.86,65.17,78.92,95.76,130.67,58.77l33.36,37.53c1.51,2.78-1.7,4.71-3.59,6.34-46.92,40.3-126.08,34.75-171.89-4.43C-11.06,193.25,38.73,39.98,160.65,30.39ZM160.65,30.39C38.73,39.98-11.06,193.25,82.61,273.37c45.81,39.18,124.97,44.73,171.89,4.43,1.89-1.62,5.1-3.55,3.59-6.34l-33.36-37.53c-51.75,36.99-125.81,6.4-130.67-58.77-5.27-70.77,69.32-109.79,127.97-75.43l34.3-39.24c-24.95-22.15-62.47-32.71-95.68-30.1h0Z"
                            />
                            <motion.path
                                fill="#f9f8fa"
                                d="M160.65,30.39c33.2-2.61,70.73,7.95,95.68,30.1l-34.3,39.24c-58.65-34.37-133.24,4.66-127.97,75.43,4.86,65.17,78.92,95.76,130.67,58.77l33.36,37.53c1.51,2.78-1.7,4.71-3.59,6.34-46.92,40.3-126.08,34.75-171.89-4.43C-11.06,193.25,38.73,39.98,160.65,30.39Z"
                            />
                        </motion.g>
                    </motion.svg>
                    <h1 className="text-5xl font-bold text-cyan-400 mt-4 mb-4">ChipLocked</h1>
                    <p className="text-slate-400">The ultimate disc golf side-game tracker</p>
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