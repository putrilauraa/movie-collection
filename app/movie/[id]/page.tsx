'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import Link from 'next/link';
import { db } from '../../../firebase/config';
import { Movie, Collection } from '../../../types';
import CollectionModal from '../../../components/CollectionModal';

export default function MovieDetailPage() {
    const { id } = useParams();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [collectionsContainingMovie, setCollectionsContainingMovie] = useState<Collection[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchMovieAndCollections = async () => {
        if (!id) return;

        const movieDoc = await getDoc(doc(db, 'movies', id as string));
        if (movieDoc.exists()) {
            const movieData = { id: movieDoc.id, ...movieDoc.data() } as Movie;
            setMovie(movieData);

            const snapshot = await getDocs(collection(db, 'collections'));
            const allCollections: Collection[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Collection, 'id'>),
            }));
            setCollections(allCollections);

            // Filter collections containing this movie
            const matched = allCollections.filter(c => c.movieIds?.includes(movieData.id));
            setCollectionsContainingMovie(matched);
        }
        };

        fetchMovieAndCollections();
    }, [id]);

    if (!movie) return <p>Loading movie...</p>;

    return (
        <div className='p-6 max-w-4xl mx-auto'>
            <div className="flex flex-col md:flex-row gap-6 mt-10">
                <div className="mb-6">
                    <img src={movie.poster} alt={movie.title} className="w-100 rounded" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
                    <p className="text-gray-500 mb-2"><strong>Release Date:</strong> {movie.year}</p>
                    <p className="text-gray-500 mb-2"><strong>Genre:</strong> {movie.genre}</p>
                    <p className="text-gray-500 mb-5"><strong>Description:</strong> {movie.description}</p>
                    <button
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Add to Collection
                    </button>
                    <div className="my-7">
                        <h2 className="text-xl font-semibold">This movie is in:</h2>
                        {collectionsContainingMovie.length === 0 ? (
                        <p className="text-gray-500">This movie is not in any collection yet.</p>
                        ) : (
                        <ul className="list-disc list-inside">
                            {collectionsContainingMovie.map(col => (
                            <li key={col.id}>
                                <Link
                                href={`/collections/${col.id}`}
                                className="text-blue-600 hover:underline"
                                >
                                {col.name}
                                </Link>
                            </li>
                            ))}
                        </ul>
                        )}
                    </div>
                </div>

                {isModalOpen && (
                    <CollectionModal
                        movies={[movie]}
                        onClose={() => setIsModalOpen(false)}
                    />
                )}
            </div>
        </div>
    );
}
