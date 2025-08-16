import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Modal from './Modal';
import Chip from './Chip';

// This ID is provided globally by the environment for correct Firestore pathing
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const DashboardScreen = () => {
    const [newChipName, setNewChipName] = useState('');
    const [newChipDescription, setNewChipDescription] = useState('');
    const [chips, setChips] = useState([]);

    // State for managing the delete confirmation modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [chipToDelete, setChipToDelete] = useState(null);

    useEffect(() => {
        const chipsCollectionRef = collection(db, `artifacts/${appId}/public/data/chips`);
        const unsubscribe = onSnapshot(chipsCollectionRef, (querySnapshot) => {
            const chipList = [];
            querySnapshot.forEach((doc) => {
                chipList.push({ id: doc.id, ...doc.data() });
            });
            setChips(chipList);
        });
        return () => unsubscribe();
    }, []);

    const handleCreateChip = async (e) => {
        e.preventDefault();
        if (!newChipName.trim()) {
            console.log("Chip name cannot be empty.");
            return;
        }

        try {
            await addDoc(collection(db, `artifacts/${appId}/public/data/chips`), {
                name: newChipName.trim(),
                description: newChipDescription.trim(),
                createdAt: new Date(),
            });
            setNewChipName('');
            setNewChipDescription('');
            console.log("Chip created successfully!");
        } catch (err) {
            console.error("Error creating chip:", err);
        }
    };

    // Handler to open the delete confirmation modal
    const handleDeleteClick = (chip) => {
        setChipToDelete(chip);
        setIsDeleteModalOpen(true);
    };

    // Handler to confirm and delete the chip
    const confirmDelete = async () => {
        if (!chipToDelete) return;

        try {
            const chipDocRef = doc(db, `artifacts/${appId}/public/data/chips`, chipToDelete.id);
            await deleteDoc(chipDocRef);
            console.log(`Chip "${chipToDelete.name}" deleted successfully.`);
            setIsDeleteModalOpen(false);
            setChipToDelete(null);
        } catch (err) {
            console.error("Error deleting chip:", err);
            setIsDeleteModalOpen(false);
            setChipToDelete(null);
        }
    };

    // Sort chips alphabetically for display
    const sortedChips = [...chips].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="bg-slate-900 text-white min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-cyan-400 mb-6">Chip Dashboard</h1>
                <div className="bg-slate-800 p-6 rounded-lg mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Create New Chip</h2>
                    <form onSubmit={handleCreateChip} className="flex flex-col space-y-4">
                        <input
                            type="text"
                            value={newChipName}
                            onChange={(e) => setNewChipName(e.target.value)}
                            placeholder="Enter chip name (e.g., 'Ace Chip')"
                            className="bg-slate-700 w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <textarea
                            value={newChipDescription}
                            onChange={(e) => setNewChipDescription(e.target.value)}
                            placeholder="Enter a description for the chip"
                            className="bg-slate-700 w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 rounded-md py-2 font-semibold transition-colors">
                            Add Chip
                        </button>
                    </form>
                </div>

                <div className="bg-slate-800 p-6 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Existing Chips</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {sortedChips.map((chip) => (
                            <div key={chip.id} className="text-center flex flex-col items-center">
                                <Chip chipName={chip.name} owner={null} />
                                <button
                                    onClick={() => handleDeleteClick(chip)}
                                    className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                        {chips.length === 0 && (
                            <p className="col-span-full text-center text-slate-400">No chips created yet. Add one above!</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
                {chipToDelete && (
                    <div className="flex flex-col space-y-4 text-center">
                        <p className="text-slate-400">Are you sure you want to delete the chip: <span className="font-bold text-red-400">{chipToDelete.name}</span>?</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700 rounded-md py-2 px-4 font-semibold transition-colors"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="bg-slate-500 hover:bg-slate-600 rounded-md py-2 px-4 font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DashboardScreen;