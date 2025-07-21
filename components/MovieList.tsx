'use client';

import { useState } from 'react';
import MovieCard from './MovieCard';
import CollectionModal from './CollectionModal';
import { Movie } from '../types';

type Props = {
    movies: Movie[];
    enableMultiSelect?: boolean;
};

const MovieList = ({ movies, enableMultiSelect = false }: Props) => {
    const [selected, setSelected] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleSelect = (id: string) => {
        setSelected(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectedMovies = movies.filter(movie => selected.includes(movie.id));

    return (
        <div>
            {enableMultiSelect && selected.length > 0 && (
                <div className="mb-4 flex justify-between items-center">
                    <span>{selected.length} selected</span>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Add to Collection
                    </button>
                </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {movies.map(movie => (
                <MovieCard
                    key={movie.id}
                    movie={movie}
                    selectable={enableMultiSelect}
                    selected={selected.includes(movie.id)}
                    onSelect={() => toggleSelect(movie.id)}
                />
                ))}
            </div>
            {isModalOpen && (
                <CollectionModal
                    movies={selectedMovies}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelected([]);
                    }}
                />
            )}
        </div>
    );
};

export default MovieList;