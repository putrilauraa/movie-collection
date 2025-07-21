export interface Movie {
    id: string;
    title: string;
    genre: string;
    description: string;
    poster: string;
    year: string;
    [key: string]: any;
}

export interface Collection {
    id: string;
    name: string;
    movieIds: string[];
}

export interface User {
    uid: string;
    email: string;
    displayName: string;
}