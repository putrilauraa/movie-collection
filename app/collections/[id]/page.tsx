'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { Collection, Movie } from '../../../types';
// import MovieList from '../../../components/MovieList';

export default function CollectionDetailPage() {
    const { id } = useParams();
    const [collectionData, setCollectionData] = useState<Collection | null>(null);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [movieToRemove, setMovieToRemove] = useState<Movie | null>(null);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchCollectionAndMovies = async () => {
            if (!id) return;

            const colRef = doc(db, 'collections', id as string);
            const colSnap = await getDoc(colRef);
            if (!colSnap.exists()) return;

            const collectionDoc = colSnap.data() as Omit<Collection, 'id'>;
            const fullCollection: Collection = {
                id: colSnap.id,
                ...collectionDoc,
                movieIds: collectionDoc.movieIds || [],
            };
            setCollectionData(fullCollection);
            setEditName(collectionDoc.name);

            if (Array.isArray(fullCollection.movieIds) && fullCollection.movieIds.length > 0) {
                const moviePromises = fullCollection.movieIds.map(async movieId => {
                    const movieDoc = await getDoc(doc(db, 'movies', movieId));
                    if (movieDoc.exists()) {
                        return { id: movieDoc.id, ...movieDoc.data() } as Movie;
                    }
                    return null;
                });

                const movieResults = await Promise.all(moviePromises);
                const validMovies = movieResults.filter((m): m is Movie => m !== null);
                setMovies(validMovies);
            } else {
                setMovies([]);
            }
        };

        fetchCollectionAndMovies();
    }, [id]);

    if (!collectionData) return <p>Loading collection...</p>;

    const handleRemoveMovie = async () => {
        if (!collectionData || !movieToRemove) return;

        try {
            const newMovieIds = collectionData.movieIds.filter(id => id !== movieToRemove.id);
            await updateDoc(doc(db, 'collections', collectionData.id), {
                movieIds: newMovieIds,
            });

            // Update UI
            setCollectionData(prev => prev ? { ...prev, movieIds: newMovieIds } : null);
            setMovies(prev => prev.filter(m => m.id !== movieToRemove.id));

            setShowRemoveModal(false);
            setMovieToRemove(null);
        } catch (error) {
            console.error('Failed to remove movie from collection:', error);
        }
    };

    const handleEditCollection = async () => {
        if (!editName.trim()) {
            setErrorMessage('Collection name cannot be empty.');
            return;
        }

        if (/[^a-zA-Z0-9\s]/.test(editName)) {
            setErrorMessage('Name cannot contain special characters.');
            return;
        }

        try {
            const allCollections = await getDocs(collection(db, 'collections'));
            const nameExists = allCollections.docs.some(
                docSnap => docSnap.id !== collectionData?.id &&
                    (docSnap.data().name as string).toLowerCase() === editName.trim().toLowerCase()
            );

            if (nameExists) {
                setErrorMessage('Collection name must be unique.');
                return;
            }

            const colRef = doc(db, 'collections', collectionData!.id);
            await updateDoc(colRef, { name: editName.trim() });

            setCollectionData(prev => prev ? { ...prev, name: editName.trim() } : null);
            setShowEditModal(false);
            setErrorMessage('');
        } catch (error) {
            console.error('Failed to update collection name:', error);
        }
    };

    return (
        <div className="p-6 relative">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold mt-2">Collection: {collectionData.name}</h1>
                <button
                    onClick={() => setShowEditModal(true)}
                    className="bg-blue-600 text-white px-4 py-1 text-sm rounded hover:bg-blue-700"
                >
                    Edit
                </button>
            </div>

            {movies.length === 0 ? (
                <p className="text-gray-500">No movies added yet.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 mt-8">
                    {movies.map(movie => (
                        <div key={movie.id} className="relative bg-white rounded shadow hover:shadow-lg hover:shadow-gray-500 transition h-92">
                            <img
                                src={movie.poster}
                                alt={movie.title}
                                className="w-full h-64 object-cover rounded-t"
                            />
                            <div className="p-4">
                                <h2 className="text-lg font-semibold text-gray-800">{movie.title}</h2>
                                <p className='text-sm text-gray-500'>{movie.year}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setMovieToRemove(movie);
                                    setShowRemoveModal(true);
                                }}
                                className="absolute bottom-4 right-4 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showRemoveModal && movieToRemove && (
                <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                        <h2 className="text-2xl font-semibold mb-2 text-gray-800">Remove Movie</h2>
                        <p className='text-gray-800'>Are you sure you want to remove <strong>{movieToRemove.title}</strong> from this collection?</p>
                        <div className="flex justify-end mt-6 gap-3">
                            <button
                                onClick={() => {
                                    setShowRemoveModal(false);
                                    setMovieToRemove(null);
                                }}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRemoveMovie}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Edit Collection Name</h2>
                        <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="w-full border px-3 py-2 rounded mb-4 text-black"
                            placeholder="Collection name"
                        />
                        {errorMessage && (
                            <p className="text-red-600 text-sm mb-4">{errorMessage}</p>
                        )}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditName(collectionData.name);
                                    setErrorMessage('');
                                }}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditCollection}
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