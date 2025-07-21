'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AddMovie from './add-movie';

type Movie = {
    id: string;
    title: string;
    description: string;
    year: number;
    genre: string;
    poster: string;
};

const AdminDashboard = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [movieToDelete, setMovieToDelete] = useState<{ id: string, title: string } | null>(null);
    const [showAddMovieForm, setShowAddMovieForm] = useState(false); // NEW

    const fetchMovies = async () => {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'movies'));
        const movieData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Movie[];
        setMovies(movieData);
        setLoading(false);
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    const handleDelete = (id: string, title: string) => {
        setMovieToDelete({ id, title });
        setShowModal(true);
    };

    const confirmDelete = async () => {
        if (!movieToDelete) return;

        await deleteDoc(doc(db, 'movies', movieToDelete.id));

        // Delete from all user collections
        const usersSnapshot = await getDocs(collection(db, 'users'));
        for (const userDoc of usersSnapshot.docs) {
            const userMovieRef = doc(db, 'users', userDoc.id, 'movies', movieToDelete.id);
            await deleteDoc(userMovieRef);
        }

        setShowModal(false);
        setMovieToDelete(null);
        fetchMovies();
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard - All Movies</h1>
                <button
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    onClick={() => setShowAddMovieForm(!showAddMovieForm)}
                >
                    {showAddMovieForm ? 'Close Form' : 'Add Movie'}
                </button>
            </div>

            {showAddMovieForm && (
                <div className="mb-6">
                    <AddMovie onMovieAdded={fetchMovies} />
                </div>
            )}

            {loading ? (
                <p>Loading movies...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {movies.map(movie => (
                        <div key={movie.id} className="bg-white rounded shadow p-3">
                            <img
                                src={movie.poster}
                                alt={movie.title}
                                className="w-full h-40 object-cover rounded mb-2"
                            />
                            <h2 className="text-lg font-semibold text-gray-800">{movie.title}</h2>
                            <p className="text-sm text-gray-600">{movie.genre} • {movie.year}</p>
                            <p className="text-xs mt-1 text-gray-500">{movie.description}</p>
                            <button
                                className="mt-2 text-sm bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                onClick={() => handleDelete(movie.id, movie.title)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showModal && movieToDelete && (
                <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <p className="mb-4 text-gray-800">
                            Are you sure you want to remove <strong>{movieToDelete.title}</strong>?
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;