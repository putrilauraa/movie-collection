'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

const RegisterPage = () => {
    const router = useRouter();
    const [form, setForm] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'user'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!form.email || !form.username || !form.password || !form.confirmPassword) {
            return setError('All fields are required.');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            return setError('Invalid email format.');
        }

        if (form.password !== form.confirmPassword) {
            return setError('Passwords do not match.');
        }

        try {
            setLoading(true);

            // Create user
            const res = await createUserWithEmailAndPassword(auth, form.email, form.password);

            // Set display name
            await updateProfile(res.user, { displayName: form.username });

            // Save user role to Firestore
            await setDoc(doc(collection(db, 'users'), res.user.uid), {
                email: form.email,
                username: form.username,
                role: form.role,
                createdAt: new Date(),
            });

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Register New Account</h2>

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                <p className='mb-1 text-gray-700 text-sm'>Email</p>
                <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    className="input mb-1 w-full border-2 border-gray-200 p-1 rounded text-black"
                />
                <p className='mb-3 text-gray-400 text-xs'>e.g. putrilaura@gmail.com</p>

                <p className='mb-1 text-gray-700 text-sm'>Username</p>
                <input
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={form.username}
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
                    className="input mb-3 w-full border-2 border-gray-200 p-1 rounded text-black"
                />

                <p className='mb-1 text-gray-700 text-sm'>Confirm Password</p>
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="input mb-3 w-full border-2 border-gray-200 p-1 rounded text-black"
                />

                <p className='mb-1 text-gray-700 text-sm'>Role</p>
                <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="mb-6 w-full border-2 border-gray-200 p-1 rounded text-black"
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
};

export default RegisterPage;