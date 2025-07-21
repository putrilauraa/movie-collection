'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

const LoginPage = () => {
    const router = useRouter();
    const [form, setForm] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!form.email || !form.password) {
            return setError('Both fields are required.');
        }

        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
            const user = userCredential.user;

            // Get role from Firestore
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const role = userDoc.data().role;
                if (role === 'admin') {
                    router.push('/admin-dashboard');
                } else {
                    router.push('/dashboard');
                }
            } else {
                setError('User role not found.');
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Login to Your Account</h2>

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                <p className='mb-1 text-gray-700 text-sm'>Email</p>
                <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    className="input mb-3 w-full border-2 border-gray-200 p-1 rounded text-black"
                />

                <p className='mb-1 text-gray-700 text-sm'>Password</p>
                <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    className="input mb-5 w-full border-2 border-gray-200 p-1 rounded text-black"
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;