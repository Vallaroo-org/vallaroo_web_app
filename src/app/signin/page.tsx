'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, LockKeyhole, Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { parseError } from '@/lib/utils';

import { useLanguage } from '@/context/LanguageContext';

export default function SignInPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [email, setEmail] = useState('');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!email) {
            newErrors.email = t('errorEmailRequired');
        }
        if (!password) {
            newErrors.password = t('errorPasswordRequired');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/');
            router.refresh();
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
        // Note: No need to stop loading on success as it redirects
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
                                {t('signInTitle')}
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                {t('signInSubtitle')}
                            </p>
                        </div>

                        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 ml-1 mb-1">
                                        {t('emailAddressLabel')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className={`h-5 w-5 ${errors.email ? 'text-red-500' : 'text-gray-400'} group-focus-within:text-blue-600 transition-colors duration-200`} />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            className={`block w-full rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} bg-white/50 py-3 pl-10 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 sm:text-sm sm:leading-6 text-base shadow-sm hover:bg-white/80`}
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (errors.email) setErrors({ ...errors, email: '' });
                                            }}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-500 animate-in slide-in-from-top-1 px-1">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center justify-between ml-1 mb-1">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                            {t('passwordLabel')} <span className="text-red-500">*</span>
                                        </label>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <LockKeyhole className={`h-5 w-5 ${errors.password ? 'text-red-500' : 'text-gray-400'} group-focus-within:text-blue-600 transition-colors duration-200`} />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            className={`block w-full rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-300'} bg-white/50 py-3 pl-10 pr-10 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 sm:text-sm sm:leading-6 text-base shadow-sm hover:bg-white/80`}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (errors.password) setErrors({ ...errors, password: '' });
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" aria-hidden="true" />
                                            ) : (
                                                <Eye className="h-5 w-5" aria-hidden="true" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-500 animate-in slide-in-from-top-1 px-1">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-800">
                                        {t('rememberMe')}
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                                        {t('forgotPassword')}
                                    </a>
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-50 p-4 border border-red-200 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">
                                                {parseError(error)}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : null}
                                    {t('signInButton')}
                                </button>
                            </div>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white/80 px-2 text-gray-500 rounded-lg backdrop-blur-sm">
                                    {t('orContinueWith')}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-3 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                <span className="text-sm font-semibold leading-6">Google</span>
                            </button>
                        </div>
                        <p className="mt-10 text-center text-sm text-gray-500">
                            {t('dontHaveAccount')}{' '}
                            <Link href="/signup" className="font-semibold leading-6 text-blue-600 hover:text-blue-500 hover:underline transition-all duration-200">
                                {t('signUpLink')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
