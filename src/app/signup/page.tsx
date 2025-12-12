'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, LockKeyhole, User } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function SignUpPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="flex pt-20 pb-12 justify-center items-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-8 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-6">
                            <Mail className="h-8 w-8 text-green-600 dark:text-green-300" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Verify your account</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                            We have sent a verification email to <span className="font-semibold text-gray-900 dark:text-white">{email}</span>.
                            Please check your inbox and click the link to activate your account.
                        </p>
                        <Link
                            href="/signin"
                            className="inline-flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <div className="flex pt-20 pb-12 justify-center items-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-8 py-10">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Join Vallaroo today
                            </p>
                        </div>

                        <form onSubmit={handleSignUp} className="space-y-6">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-colors"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockKeyhole className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-colors"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                                Authentication Error
                                            </h3>
                                            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                                {error}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    disabled={loading}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Sign up with Google
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
