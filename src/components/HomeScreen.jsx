// src/components/HomeScreen.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
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

const HomeScreen = () => {
    const navigate = useNavigate();

    const handleCreateGame = async () => {
        const hostName = prompt("Please enter your name:");
        if (!hostName) return;

        // --- CHANGE IS HERE ---
        localStorage.setItem('playerName', hostName);

        try {
            const roomCode = generateRoomCode();
            const gameDocRef = await addDoc(collection(db, "games"), {
                roomCode: roomCode,
                players: [hostName],
                host: hostName,
                chipState: {},
                createdAt: new Date(),
            });
            navigate(`/game/${gameDocRef.id}`);
        } catch (e) {
            console.error("Error creating game: ", e);
        }
    };

    const handleJoinGame = async () => {
        const roomCode = prompt("Enter the 6-character room code:");
        if (!roomCode || roomCode.length !== 6) {
            alert("Invalid room code.");
            return;
        }

        const playerName = prompt("Please enter your name:");
        if (!playerName) return;

        // --- AND CHANGE IS HERE ---
        localStorage.setItem('playerName', playerName);

        try {
            const gamesRef = collection(db, "games");
            const q = query(gamesRef, where("roomCode", "==", roomCode.toUpperCase()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                alert("Game not found! Please check the room code.");
            } else {
                const gameDoc = querySnapshot.docs[0];
                await updateDoc(gameDoc.ref, { players: arrayUnion(playerName) });
                navigate(`/game/${gameDoc.id}`);
            }
        } catch (e) {
            console.error("Error joining game: ", e);
        }
    };

    return (
        <div className="bg-slate-900 text-white min-h-screen flex flex-col justify-center items-center p-4">
            <h1 className="text-5xl font-bold text-cyan-400 mb-2">Chip-locked</h1>
            <p className="text-slate-400 mb-12">The ultimate disc golf side-game tracker</p>
            <div className="space-y-6 w-full max-w-sm">
                <div
                    onClick={handleCreateGame}
                    className="bg-slate-800 p-6 rounded-lg text-center cursor-pointer hover:bg-slate-700 transition-colors"
                >
                    <h2 className="text-2xl font-semibold mb-2">Create Game</h2>
                    <p className="text-slate-400">Start a new game and invite your friends.</p>
                </div>
                <div
                    onClick={handleJoinGame}
                    className="bg-slate-800 p-6 rounded-lg text-center cursor-pointer hover:bg-slate-700 transition-colors"
                >
                    <h2 className="text-2xl font-semibold mb-2">Join Game</h2>
                    <p className="text-slate-400">Join an existing game with a room code.</p>
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;