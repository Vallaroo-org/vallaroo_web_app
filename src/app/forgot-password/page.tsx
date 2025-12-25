'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Loader2, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { parseError } from '@/lib/utils';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/update-password`,
        });

        if (error) {
            setError(error.message);
        } else {
            setMessage('Check your email for the reset link');
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen flex-col bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-200 via-slate-100 to-indigo-200 relative overflow-hidden">
            <Navbar />
            <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative">
                {/* Decorative background blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/30 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/30 blur-[100px]" />

                <div className="w-full max-w-md relative z-10 glass rounded-2xl p-8 shadow-2xl border border-white/20">
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                                Reset Password
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Enter your email to receive instructions
                            </p>
                        </div>

                        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 ml-1 mb-1">
                                        Email address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            className="block w-full rounded-xl border-gray-300 bg-white/50 py-3 pl-10 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 sm:text-sm sm:leading-6 text-base shadow-sm hover:bg-white/80"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 text-center animate-in fade-in slide-in-from-top-1 border border-red-100">
                                    <span className="font-medium">Error:</span> {parseError(error)}
                                </div>
                            )}

                            {message && (
                                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-600 text-center animate-in fade-in slide-in-from-top-1 border border-green-100 flex items-center justify-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    {message}
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative flex w-full justify-center items-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {loading ? 'Sending link...' : 'Send Reset Link'}
                                </button>
                            </div>

                            <div className="text-center text-sm">
                                <Link
                                    href="/signin"
                                    className="font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center justify-center gap-1 group/back"
                                >
                                    <ArrowLeft className="h-4 w-4 group-hover/back:-translate-x-1 transition-transform" />
                                    Back to sign in
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
