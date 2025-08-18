// src/components/ChipDashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, writeBatch, onSnapshot, doc } from "firebase/firestore";
import { db } from '../firebase';
import Papa from 'papaparse';

// A reusable Chip component for display purposes
const ChipDisplay = ({ name, type }) => {
    const chipColor = type === 'bad' ? 'bg-red-500 border-red-700' : 'bg-green-500 border-green-700';
    return (
        <div className={`w-24 h-24 rounded-full flex flex-col justify-center items-center p-2 text-center shadow-lg border-4 ${chipColor}`}>
            <span className="font-bold text-sm leading-tight">{name}</span>
        </div>
    );
};

const ChipDashboard = () => {
    const [chipName, setChipName] = useState('');
    const [chipType, setChipType] = useState('good'); // 'good' or 'bad'
    const [chipDescription, setChipDescription] = useState('');
    const [allChips, setAllChips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState('');

    // --- New State for Password Protection ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [authFeedback, setAuthFeedback] = useState('');

    // Listen for real-time updates to the chips collection
    useEffect(() => {
        const chipsCollectionRef = collection(db, 'chip-types');
        const unsubscribe = onSnapshot(chipsCollectionRef, (snapshot) => {
            const chipsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllChips(chipsData);
            setIsLoading(false);
        });

        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, []);

    const handleAddChip = async (e) => {
        e.preventDefault();
        if (!chipName) {
            setFeedback('Please enter a chip name.');
            return;
        }

        try {
            await addDoc(collection(db, "chip-types"), {
                name: chipName,
                type: chipType,
                description: chipDescription,
            });
            setFeedback(`Successfully added "${chipName}"!`);
            setChipName(''); // Reset form
            setChipDescription('');
        } catch (error) {
            console.error("Error adding chip: ", error);
            setFeedback('Error adding chip. Please try again.');
        }
    };

    const handleCsvImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const chipsToUpload = results.data
                    .filter(row => row.name && (row.type === 'good' || row.type === 'bad'))
                    .map(row => ({
                        name: row.name.trim(),
                        type: row.type.trim(),
                        description: row.description ? row.description.trim() : ''
                    }));

                if (chipsToUpload.length === 0) {
                    setFeedback('CSV file is empty or has invalid data. Ensure columns are "name", "type", and "description".');
                    return;
                }

                try {
                    const batch = writeBatch(db);
                    const chipsCollectionRef = collection(db, 'chip-types');

                    chipsToUpload.forEach(chipData => {
                        const newChipRef = doc(chipsCollectionRef);
                        batch.set(newChipRef, chipData);
                    });

                    await batch.commit();
                    setFeedback(`Successfully imported ${chipsToUpload.length} chips!`);
                } catch (error) {
                    console.error("Error importing CSV: ", error);
                    setFeedback('Error importing chips. Please check the console.');
                }
            },
            error: (error) => {
                console.error("Error parsing CSV:", error);
                setFeedback('Failed to parse CSV file.');
            }
        });
    };

    // --- New Password Handler ---
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        // A simple hardcoded password for demonstration.
        // In a real app, you would use a more secure method.
        if (passwordInput === '1234') {
            setIsAuthenticated(true);
            setAuthFeedback('');
        } else {
            setAuthFeedback('Incorrect password. Please try again.');
            setPasswordInput('');
        }
    };

    // --- Conditional Rendering for Password Protection ---
    if (!isAuthenticated) {
        return (
            <div className="bg-slate-900 text-white min-h-screen flex flex-col justify-center items-center">
                <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
                    <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
                    <p className="text-slate-400 mb-6">Please enter the 4-digit password to continue.</p>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <input
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]{4}"
                            maxLength="4"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="****"
                            className="w-full bg-slate-700 border-2 border-slate-600 rounded-md p-3 text-center text-2xl tracking-widest focus:outline-none focus:border-cyan-400"
                            required
                        />
                        {authFeedback && <div className="text-red-400">{authFeedback}</div>}
                        <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 rounded-md p-3 font-bold transition">
                            Unlock
                        </button>
                    </form>
                    <Link to="/" className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block">&larr; Back to Home</Link>
                </div>
            </div>
        );
    }

    // --- Normal Dashboard Content (only renders if isAuthenticated is true) ---
    return (
        <div className="bg-slate-900 text-white min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-cyan-400">Chip Dashboard</h1>
                    <p className="text-slate-400">Manage all available game chips here.</p>
                    <Link to="/" className="text-cyan-400 hover:text-cyan-300 mt-2 inline-block">&larr; Back to Home</Link>
                </div>

                {feedback && <div className="bg-slate-700 p-3 rounded-md text-center mb-6">{feedback}</div>}

                {/* --- Management Section --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Create Single Chip */}
                    <div className="bg-slate-800 p-6 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4 border-b border-slate-700 pb-2">Create a New Chip</h2>
                        <form onSubmit={handleAddChip} className="space-y-4">
                            <input
                                type="text"
                                value={chipName}
                                onChange={(e) => setChipName(e.target.value)}
                                placeholder="Chip Name (e.g., Birdie)"
                                className="w-full bg-slate-700 border-2 border-slate-600 rounded-md p-3 focus:outline-none focus:border-cyan-400"
                            />
                            <textarea
                                value={chipDescription}
                                onChange={(e) => setChipDescription(e.target.value)}
                                placeholder="Chip Description"
                                className="w-full bg-slate-700 border-2 border-slate-600 rounded-md p-3 focus:outline-none focus:border-cyan-400 h-24 resize-none"
                            />
                            <select
                                value={chipType}
                                onChange={(e) => setChipType(e.target.value)}
                                className="w-full bg-slate-700 border-2 border-slate-600 rounded-md p-3 focus:outline-none focus:border-cyan-400"
                            >
                                <option value="good">Good Chip</option>
                                <option value="bad">Bad Chip</option>
                            </select>
                            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 rounded-md p-3 font-bold transition">
                                Add Chip
                            </button>
                        </form>
                    </div>

                    {/* Import from CSV */}
                    <div className="bg-slate-800 p-6 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4 border-b border-slate-700 pb-2">Import from CSV</h2>
                        <p className="text-slate-400 mb-4 text-sm">
                            Upload a CSV file with three columns: `name`, `type`, and `description`.
                        </p>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleCsvImport}
                            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500"
                        />
                    </div>
                </div>

                {/* --- Display Section --- */}
                <div>
                    <h2 className="text-3xl font-bold mb-6 text-center">Available Chips</h2>
                    {isLoading ? (
                        <p className="text-center">Loading chips...</p>
                    ) : (
                        <div className="flex flex-wrap justify-center gap-4">
                            {allChips.length > 0 ? (
                                allChips.map(chip => <ChipDisplay key={chip.id} name={chip.name} type={chip.type} />)
                            ) : (
                                <p className="text-slate-400">No chips created yet. Add one above!</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChipDashboard;