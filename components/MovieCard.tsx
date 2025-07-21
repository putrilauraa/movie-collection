'use client';

import Link from 'next/link';
import { Movie } from '../types';

type Props = {
    movie: Movie;
    selectable?: boolean;
    selected?: boolean;
    onSelect?: () => void;
};

const MovieCard = ({ movie, selectable, selected, onSelect }: Props) => {
    return (
        <div
            className={`bg-white text-gray-800 rounded p-3 relative h-73 ${
                selectable && selected ? 'border-2 border-blue-500 bg-blue-100' : 'hover:shadow-lg hover:shadow-gray-400'
            }`}
        >
            {selectable ? (
                <button
                    onClick={onSelect}
                    className="absolute bottom-3 right-3 bg-blue-500 text-white text-lg rounded-full px-2"
                    >
                    {selected ? '✓' : '+'}
                </button>
            ) : null}

            <Link href={`/movie/${movie.id}`}>
                <div>
                    <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-48 object-cover rounded mb-2"
                    />
                    <h3 className="text-lg font-semibold">{movie.title}</h3>
                    <p className="text-sm text-gray-600">{movie.year}</p>
                </div>
            </Link>
        </div>
    );
};

export default MovieCard;