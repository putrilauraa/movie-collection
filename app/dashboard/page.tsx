'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import MovieList from '../../components/MovieList';

export default function DashboardPage() {
    const [movies, setMovies] = useState<any[]>([]);

    useEffect(() => {
        const fetchMovies = async () => {
            const querySnapshot = await getDocs(collection(db, 'movies'));
            const movieList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMovies(movieList.slice(0, 10));
        };

        fetchMovies();
    }, []);

    return (
        <main className="p-10">
            <h1 className="text-2xl font-bold mb-2">Movie Dashboard</h1>
            <p className="mb-6">Browse movies and add to your collections!</p>
            <MovieList movies={movies} enableMultiSelect />
        </main>
    );
}