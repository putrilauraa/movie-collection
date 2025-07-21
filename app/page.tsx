'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HomePage() {
    const pathname = usePathname();

    return (
        <>
            <div className="flex justify-center items-center mt-60">
                <h1 className="text-3xl font-bold">Welcome to Movie Collection App</h1>
            </div>
            <div className="flex justify-center items-center space-x-4 mt-4">
                <Link href="/register" className={pathname === '/login' ? 'underline' : 'bg-blue-500 py-2 px-4 rounded hover:opacity-80'}>Register</Link>
                <Link href="/login" className={pathname === '/login' ? 'underline' : 'bg-blue-500 py-2 px-4 rounded hover:opacity-80'}>Login</Link>
            </div>
        </>
    );
}