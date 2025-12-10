'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function ProfilePage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            // First set user from session
            setUser(session.user);

            // Then fetch latest profile data to ensure we have the up-to-date avatar
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('avatar_url')
                    .eq('id', session.user.id)
                    .single();

                if (profile && profile.avatar_url) {
                    // Update user state with the profile's avatar_url, overriding session metadata if present
                    setUser((prev: any) => ({
                        ...prev,
                        user_metadata: {
                            ...prev.user_metadata,
                            avatar_url: profile.avatar_url
                        }
                    }));
                }
            } catch (err) {
                console.error("Error fetching latest profile:", err);
            }
        } else {
            // redirect? or show login
        }
        setLoading(false);
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const confirmDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') return;

        try {
            const { error } = await supabase.functions.invoke('delete-user-account');
            if (error) throw error;

            await supabase.auth.signOut();
            router.push('/');
            alert("Account deleted securely.");
        } catch (err) {
            console.error("Delete failed", err);
            alert("Unable to delete account automatically. Please contact support.");
        }
    };

    const handleAvatarClick = () => {
        document.getElementById('avatar-upload')?.click();
    };

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;

        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        setLoading(true);
        try {
            const { error: uploadError } = await supabase.storage
                .from('profile-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('profile-images')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) throw updateError;

            await supabase
                .from('profiles')
                .upsert({ id: user.id, avatar_url: publicUrl });

            const { data: { session } } = await supabase.auth.refreshSession();
            if (session) setUser(session.user);

        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Error updating profile picture.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-muted-foreground">Loading...</div>;

    if (!user) {
        return (
            <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <h1 className="text-2xl font-bold mb-4">{t('profile')}</h1>
                    <p className="text-muted-foreground mb-6">Please sign in to view your profile.</p>
                    <div className="flex gap-4">
                        <Link href="/signin" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
                            {t('signIn')}
                        </Link>
                        <Link href="/signup" className="px-6 py-2 bg-card border border-input text-foreground rounded-lg font-medium hover:bg-accent hover:text-accent-foreground">
                            {t('signUp')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
            <Navbar />
            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl mx-auto">
                    <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border overflow-hidden relative">
                        <div className="p-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center relative">
                            <div
                                className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold cursor-pointer relative overflow-hidden group"
                                onClick={handleAvatarClick}
                            >
                                {user.user_metadata?.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{user.email?.[0].toUpperCase()}</span>
                                )}

                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-medium">Edit</span>
                                </div>
                            </div>
                            <input
                                type="file"
                                id="avatar-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />

                            {user.user_metadata?.full_name && (
                                <h1 className="text-2xl font-bold">{user.user_metadata.full_name}</h1>
                            )}
                            <p className="opacity-90">{user.email}</p>
                        </div>

                        <div className="p-6">
                            <div className="space-y-2">
                                <Link href="/profile/orders" className="block p-4 border border-border rounded-xl hover:bg-accent/50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <span className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">📦</span>
                                        <span className="font-medium text-foreground">{t('myOrders')}</span>
                                    </div>
                                    <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                                </Link>

                                <Link href="/profile/addresses" className="block p-4 border border-border rounded-xl hover:bg-accent/50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <span className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">📍</span>
                                        <span className="font-medium text-foreground">{t('savedAddresses')}</span>
                                    </div>
                                    <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                                </Link>
                            </div>

                            <div className="mt-8 pt-6 border-t border-border space-y-3">
                                <button
                                    onClick={handleSignOut}
                                    className="w-full py-3 text-muted-foreground font-medium hover:bg-accent/50 rounded-lg transition-colors"
                                >
                                    {t('logOut')}
                                </button>

                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="w-full py-3 text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>

                        {/* Delete Modal Overlay */}
                        {showDeleteModal && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                                <div className="bg-card text-card-foreground rounded-xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in-95 duration-200">
                                    <h3 className="text-lg font-bold mb-2">Delete Account</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        This action is irreversible. All your data will be lost.
                                        <br />
                                        Type <strong>DELETE</strong> below to confirm.
                                    </p>
                                    <input
                                        type="text"
                                        value={deleteConfirmation}
                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                        placeholder="Type DELETE"
                                        className="w-full px-3 py-2 border border-input rounded-lg mb-4 bg-background focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowDeleteModal(false);
                                                setDeleteConfirmation('');
                                            }}
                                            className="flex-1 px-4 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDeleteAccount}
                                            disabled={deleteConfirmation !== 'DELETE'}
                                            className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
