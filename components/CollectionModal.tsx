'use client';

import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    arrayUnion,
} from 'firebase/firestore';
import { Collection, Movie } from '../types';

type Props = {
    movies: Movie[];
    onClose: () => void;
};

export default function CollectionModal({ movies, onClose }: Props) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [newCollectionName, setNewCollectionName] = useState('');

    useEffect(() => {
        const fetchCollections = async () => {
            const snapshot = await getDocs(collection(db, 'collections'));
            const result: Collection[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Collection, 'id'>),
            }));
            setCollections(result);
        };

        fetchCollections();
    }, []);

    const handleSave = async () => {
        if (selectedId) {
            const colRef = doc(db, 'collections', selectedId);
            await updateDoc(colRef, {
                movieIds: arrayUnion(...movies.map(m => m.id)),
            });
        } else if (newCollectionName.trim()) {
            await addDoc(collection(db, 'collections'), {
                name: newCollectionName.trim(),
                movieIds: movies.map(m => m.id),
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Add to Collection</h2>

                {/* Existing collections list */}
                <div className="space-y-2 mb-4">
                {collections.map(col => (
                    <label key={col.id} className="flex items-center gap-2 text-gray-800">
                        <input
                            type="radio"
                            name="collection"
                            value={col.id}
                            checked={selectedId === col.id}
                            onChange={() => setSelectedId(col.id)}
                        />
                        <span>{col.name}</span>
                    </label>
                ))}
                </div>

                {/* Divider */}
                <div className="my-4 text-center text-sm text-gray-500">or create new</div>

                {/* New collection input */}
                <input
                    type="text"
                    placeholder="New collection name"
                    value={newCollectionName}
                    onChange={e => {
                        setNewCollectionName(e.target.value);
                        setSelectedId(null);
                    }}
                    className="w-full border-1 p-2 rounded mb-4 text-black"
                />

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-400 rounded">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        disabled={!selectedId && !newCollectionName.trim()}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
