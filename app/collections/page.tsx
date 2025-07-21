'use client';

import { useEffect, useState } from 'react';
import { db } from '../../firebase/config';
import { Collection, Movie } from '../../types';
import { collection as fbCollection, getDocs, doc, getDoc, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function CollectionsPage() {
    const [collections, setCollections] = useState<(Collection & { coverUrl?: string })[]>([]);
    const [newName, setNewName] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [collectionToEdit, setCollectionToEdit] = useState<Collection | null>(null);
    const [editName, setEditName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchCollections = async () => {
            const querySnapshot = await getDocs(fbCollection(db, 'collections'));

            const fetched = querySnapshot.docs.map(doc => {
                const data = doc.data() as Omit<Collection, 'id'>;
                return { id: doc.id, ...data };
            });

            const withCovers = await Promise.all(
                fetched.map(async col => {
                    const hasMovies = Array.isArray(col.movieIds) && col.movieIds.length > 0;
                    if (hasMovies) {
                        try {
                            const movieDoc = await getDoc(doc(db, 'movies', col.movieIds[0]));
                            if (movieDoc.exists()) {
                                const movie = movieDoc.data() as Movie;
                                return { ...col, coverUrl: movie.poster || '/default-movie-cover.png' };
                            }
                        } catch (error) {
                            console.warn('Failed to fetch movie poster for collection:', col.id);
                        }
                    }
                    return { ...col, coverUrl: '/default-movie-cover.png' };
                })
            );

            setCollections(withCovers);
        };

        fetchCollections();
    }, []);


    const createCollection = async () => {
        if (!newName.trim()) return;

        const docRef = await addDoc(fbCollection(db, 'collections'), {
            name: newName,
            movieIds: [],
        });

        setCollections(prev => [
            ...prev,
            { id: docRef.id, name: newName, movieIds: [], coverUrl: '/default-movie-cover.png' },
        ]);
        setNewName('');
    };

    const handleDelete = async () => {
        if (!collectionToDelete) return;

        try {
            await deleteDoc(doc(db, 'collections', collectionToDelete.id));
            setCollections(prev => prev.filter(col => col.id !== collectionToDelete.id));
            setShowModal(false);
            setCollectionToDelete(null);
        } catch (error) {
            console.error('Error deleting collection:', error);
        }
    };

    const handleEditSubmit = async () => {
        if (!collectionToEdit) return;

        const trimmedName = editName.trim();

        if (!trimmedName) {
            setErrorMessage('Collection name is required.');
            return;
        }

        const isValid = /^[a-zA-Z0-9 ]+$/.test(trimmedName);
        if (!isValid) {
            setErrorMessage('No special characters allowed.');
            return;
        }

        const nameTaken = collections.some(
            col => col.name.toLowerCase() === trimmedName.toLowerCase() && col.id !== collectionToEdit.id
        );
        if (nameTaken) {
            setErrorMessage('Collection name must be unique.');
            return;
        }

        try {
            await updateDoc(doc(db, 'collections', collectionToEdit.id), {
                name: trimmedName,
            });

            setCollections(prev =>
                prev.map(col =>
                    col.id === collectionToEdit.id ? { ...col, name: trimmedName } : col
                )
            );
            setShowEditModal(false);
            setCollectionToEdit(null);
            setEditName('');
            setErrorMessage('');
        } catch (error) {
            console.error('Failed to update collection name:', error);
        }
    };


    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">My Collections</h1>

            <div className="flex items-center mb-6 gap-3">
                <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="New collection name"
                    className="border px-3 py-2 rounded w-full"
                />
                <button
                    onClick={createCollection}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Add
                </button>
            </div>

            {collections.length === 0 ? (
                <p className="text-gray-600">No collections yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {collections.map(col => (
                        <div key={col.id} className="relative border rounded shadow hover:shadow-lg hover:shadow-gray-500 transition h-78">
                            <Link href={`/collections/${col.id}`}>
                                <img
                                    src={col.coverUrl}
                                    alt={`${col.name} cover`}
                                    className="w-full h-48 object-cover rounded-t"
                                />
                                <div className="p-4">
                                    <h2 className="text-lg font-semibold">{col.name}</h2>
                                    <span className="text-sm text-gray-600">
                                        {col.movieIds?.length || 0} movies
                                    </span>
                                </div>
                            </Link>
                            <button
                                onClick={() => {
                                    setCollectionToEdit(col);
                                    setEditName(col.name);
                                    setErrorMessage('');
                                    setShowEditModal(true);
                                }}
                                className="absolute bottom-4 right-21 bg-white text-gray-800 text-xs px-4 py-1 rounded hover:opacity-80"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => {
                                    setCollectionToDelete(col);
                                    setShowModal(true);
                                }}
                                className="absolute bottom-4 right-4 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showModal && collectionToDelete && (
                <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
                    <div className="bg-white rounded shadow-md p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-2 text-gray-800">Confirm Deletion</h2>
                        <p className="mb-6 text-gray-800">
                            Are you sure you want to delete the collection{' '}
                            <span className="font-bold">{collectionToDelete.name}</span>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && collectionToEdit && (
                <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
                    <div className="bg-white rounded shadow-md p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Collection</h2>
                        <label className="block mb-2 text-sm font-medium text-gray-800">New name for <strong>{collectionToEdit.name}</strong></label>
                        <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="w-full border px-3 py-2 rounded mb-3 text-black"
                        />
                        {errorMessage && (
                            <p className="text-red-600 text-sm mb-2">{errorMessage}</p>
                        )}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setCollectionToEdit(null);
                                    setEditName('');
                                    setErrorMessage('');
                                }}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
