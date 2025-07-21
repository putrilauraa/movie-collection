'use client';

import { useState } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

const AddMovie = ({ onMovieAdded }: { onMovieAdded: () => void }) => {
    const [form, setForm] = useState({
        title: '',
        description: '',
        year: '',
        genre: '',
        poster: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!form.title || !form.description || !form.year || !form.genre || !form.poster) {
            return setError('All fields are required.');
        }

        try {
            setLoading(true);
            await addDoc(collection(db, 'movies'), {
                ...form,
                year: parseInt(form.year),
            });
            setForm({ title: '', description: '', year: '', genre: '', poster: '' });
            onMovieAdded();
        } catch (err: any) {
            setError('Failed to add movie.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-100 rounded">
            <h2 className="text-xl font-bold mb-3 text-gray-800">Add New Movie</h2>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <p className='text-sm text-gray-800 mb-1'>Title</p>
            <input type="text" name="title" placeholder="Enter movie title" value={form.title} onChange={handleChange} className="input w-full p-2 mb-4 border rounded text-black" />
            <p className='text-sm text-gray-800 mb-1'>Description</p>
            <textarea name="description" placeholder="Enter movie description" value={form.description} onChange={handleChange} className="input w-full p-2 mb-2 border rounded text-black" />
            <p className='text-sm text-gray-800 mb-1'>Year Released</p>
            <input type="text" name="year" placeholder="Enter movie released date" value={form.year} onChange={handleChange} className="input w-full p-2 mb-4 border rounded text-black" />
            <p className='text-sm text-gray-800 mb-1'>Genre</p>
            <input type="text" name="genre" placeholder="Enter movie genre" value={form.genre} onChange={handleChange} className="input w-full p-2 mb-4 border rounded text-black" />
            <p className='text-sm text-gray-800 mb-1'>Poster URL</p>
            <input type="text" name="poster" placeholder="Enter movie poster URL" value={form.poster} onChange={handleChange} className="input w-full p-2 mb-6 border rounded text-black" />

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
                {loading ? 'Adding...' : 'Add Movie'}
            </button>
        </form>
    );
};

export default AddMovie;