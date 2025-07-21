'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
    const pathname = usePathname();

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="font-bold text-xl">Movie Collection</h1>
                <div className="space-x-4">
                    <Link href="/" className={pathname === '/' ? 'underline' : ''}>Home</Link>
                    {/* <Link href="/login" className={pathname === '/login' ? 'underline' : ''}>Login</Link>
                    <Link href="/register" className={pathname === '/register' ? 'underline' : ''}>Register</Link> */}
                    <Link href="/dashboard" className={pathname.startsWith('/dashboard') ? 'underline' : ''}>Movies</Link>
                    <Link href="/collections" className={pathname.startsWith('/collections') ? 'underline' : ''}>My Collection</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;