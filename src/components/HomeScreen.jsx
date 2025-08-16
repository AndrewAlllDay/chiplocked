import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from '../firebase';
import Modal from './Modal';

const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const HomeScreen = () => {
    const navigate = useNavigate();

    // State for the "Create Game" form
    const [isCreatingGame, setIsCreatingGame] = useState(false);
    const [hostName, setHostName] = useState('');

    // State for the "Join Game" form
    const [isJoiningGame, setIsJoiningGame] = useState(false);
    const [roomCode, setRoomCode] = useState('');
    const [playerName, setPlayerName] = useState('');

    // State for general messages/errors
    const [message, setMessage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateGame = async (e) => {
        e.preventDefault();
        if (!hostName.trim()) {
            setMessage("Please enter your name to create a game.");
            setIsModalOpen(true);
            return;
        }

        localStorage.setItem('playerName', hostName.trim());

        try {
            const newRoomCode = generateRoomCode();
            const gameDocRef = await addDoc(collection(db, "games"), {
                roomCode: newRoomCode,
                players: [hostName.trim()],
                host: hostName.trim(),
                chipState: {},
                createdAt: new Date(),
            });
            navigate(`/game/${gameDocRef.id}`);
        } catch (err) {
            console.error("Error creating game: ", err);
            setMessage("Failed to create game. Please try again.");
            setIsModalOpen(true);
        }
    };

    const handleJoinGame = async (e) => {
        e.preventDefault();
        if (!roomCode.trim() || !playerName.trim()) {
            setMessage("Please enter both the room code and your name.");
            setIsModalOpen(true);
            return;
        }

        localStorage.setItem('playerName', playerName.trim());

        try {
            const gamesRef = collection(db, "games");
            const q = query(gamesRef, where("roomCode", "==", roomCode.trim().toUpperCase()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setMessage("Game not found! Please check the room code.");
                setIsModalOpen(true);
            } else {
                const gameDoc = querySnapshot.docs[0];
                await updateDoc(gameDoc.ref, { players: arrayUnion(playerName.trim()) });
                navigate(`/game/${gameDoc.id}`);
            }
        } catch (err) {
            console.error("Error joining game: ", err);
            setMessage("Failed to join game. Please try again.");
            setIsModalOpen(true);
        }
    };

    const toggleCreateForm = () => {
        setIsCreatingGame(!isCreatingGame);
        setIsJoiningGame(false); // Close other form
    }

    const toggleJoinForm = () => {
        setIsJoiningGame(!isJoiningGame);
        setIsCreatingGame(false); // Close other form
    }

    return (
        <div className="bg-slate-900 text-white min-h-screen flex flex-col justify-center items-center p-4">
            <h1 className="text-5xl font-bold text-cyan-400 mb-2">Chip-locked</h1>
            <p className="text-slate-400 mb-12">The ultimate disc golf side-game tracker</p>
            <div className="space-y-6 w-full max-w-sm">

                {/* Create Game Card */}
                <div className="bg-slate-800 rounded-lg transition-all duration-300">
                    <div onClick={toggleCreateForm} className="p-6 text-center cursor-pointer">
                        <h2 className="text-2xl font-semibold mb-2">Create Game</h2>
                        <p className="text-slate-400">Start a new game and invite your friends.</p>
                    </div>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isCreatingGame ? 'max-h-40' : 'max-h-0'}`}>
                        <div className="p-6 pt-0">
                            <form onSubmit={handleCreateGame} className="flex flex-col space-y-4">
                                <input
                                    type="text"
                                    value={hostName}
                                    onChange={(e) => setHostName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="bg-slate-700 w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                                <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 rounded-md py-2 font-semibold transition-colors">
                                    Let's Go!
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Join Game Card */}
                <div className="bg-slate-800 rounded-lg transition-all duration-300">
                    <div onClick={toggleJoinForm} className="p-6 text-center cursor-pointer">
                        <h2 className="text-2xl font-semibold mb-2">Join Game</h2>
                        <p className="text-slate-400">Join an existing game with a room code.</p>
                    </div>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isJoiningGame ? 'max-h-60' : 'max-h-0'}`}>
                        <div className="p-6 pt-0">
                            <form onSubmit={handleJoinGame} className="flex flex-col space-y-4">
                                <input
                                    type="text"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value)}
                                    placeholder="Enter room code"
                                    className="bg-slate-700 w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                                <input
                                    type="text"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="bg-slate-700 w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                                <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 rounded-md py-2 font-semibold transition-colors">
                                    Join Game
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Link to the new Dashboard */}
                <div className="text-center">
                    <a href="/dashboard" className="text-cyan-400 hover:underline">
                        Manage Chips
                    </a>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Heads Up!">
                <p className="text-center">{message}</p>
            </Modal>
        </div>
    );
};

export default HomeScreen;