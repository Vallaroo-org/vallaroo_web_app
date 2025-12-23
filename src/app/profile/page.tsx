'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { uploadToR2 } from '@/lib/r2-upload';
import { Loader2, Edit2, Camera, User, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
    const { t, locale } = useLanguage();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        displayName: '',
        phoneNumber: '',
    });

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            setUser(session.user);
            await fetchProfile(session.user.id);
        } else {
            setLoading(false);
        }
    };

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setProfile(data);
                setFormData({
                    displayName: data.display_name || '',
                    phoneNumber: data.phone_number || '',
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!formData.displayName.trim() || !formData.phoneNumber.trim()) {
            toast.error('Name and Mobile Number are required');
            return;
        }

        setSaving(true);
        try {
            // Translate to Malayalam
            let displayNameMl = profile?.display_name_ml;
            try {
                const res = await fetch('/api/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: formData.displayName.trim(),
                        targetLang: 'ml'
                    })
                });
                const json = await res.json();
                if (json.translatedText) {
                    displayNameMl = json.translatedText;
                }
            } catch (e) {
                console.error('Translation failed', e);
            }

            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    id: user.id,
                    display_name: formData.displayName.trim(),
                    display_name_ml: displayNameMl,
                    phone_number: formData.phoneNumber.trim(),
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            setProfile((prev: any) => ({
                ...prev,
                display_name: formData.displayName.trim(),
                display_name_ml: displayNameMl,
                phone_number: formData.phoneNumber.trim()
            }));
            setEditMode(false);
            toast.success('Profile updated successfully');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
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

        setLoading(true);
        try {
            // Upload to R2
            const { publicUrl } = await uploadToR2(file, `avatars/${user.id}`);

            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    id: user.id,
                    profile_image_url: publicUrl,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            setProfile((prev: any) => ({ ...prev, profile_image_url: publicUrl }));
            toast.success('Profile picture updated!');

        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error('Failed to update profile picture');
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
            <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">

                    {/* Profile Header Card */}
                    <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border overflow-hidden relative mb-6">
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                        <div className="px-6 pb-6 pt-0 relative flex flex-col items-center -mt-12">
                            {/* Avatar */}
                            <div className="relative group">
                                <div
                                    className="w-24 h-24 bg-background rounded-full border-4 border-card flex items-center justify-center overflow-hidden cursor-pointer"
                                    onClick={handleAvatarClick}
                                >
                                    {profile?.profile_image_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={profile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-muted-foreground">
                                            {profile?.display_name?.[0]?.toUpperCase() || user.email?.[0].toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div
                                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-sm border-2 border-background"
                                    onClick={handleAvatarClick}
                                >
                                    <Camera className="w-4 h-4" />
                                </div>
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>

                            <div className="text-center mt-3 mb-4">
                                <h1 className="text-2xl font-bold">
                                    {locale === 'ml'
                                        ? (profile?.display_name_ml || profile?.display_name || 'User')
                                        : (profile?.display_name || 'User')}
                                </h1>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>

                            {/* Edit Toggle */}
                            <button
                                onClick={() => setEditMode(!editMode)}
                                className="absolute top-4 right-4 bg-black/20 hover:bg-black/30 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Editable Fields */}
                        <div className="px-6 pb-8 border-t border-border pt-6">
                            {editMode ? (
                                <div className="space-y-4 max-w-md mx-auto">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                value={formData.displayName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                                                className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background"
                                                placeholder="Your Name"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Mobile Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="tel"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                                className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background"
                                                placeholder="Your Mobile Number"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => setEditMode(false)}
                                            className="flex-1 py-2 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</label>
                                        <div className="flex items-center gap-2 text-foreground font-medium">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            {locale === 'ml'
                                                ? (profile?.display_name_ml || profile?.display_name || '-')
                                                : (profile?.display_name || '-')}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mobile</label>
                                        <div className="flex items-center gap-2 text-foreground font-medium">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            {profile?.phone_number || '-'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                        <div className="p-2 space-y-1">
                            <Link href="/profile/orders" className="block p-3 hover:bg-accent/50 rounded-lg transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/30">📦</div>
                                    <span className="font-medium">{t('myOrders')}</span>
                                </div>
                                <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                            </Link>

                            <Link href="/profile/addresses" className="block p-3 hover:bg-accent/50 rounded-lg transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg dark:bg-green-900/30">📍</div>
                                    <span className="font-medium">{t('savedAddresses')}</span>
                                </div>
                                <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        </div>

                        <div className="border-t border-border p-2 space-y-1">
                            <button
                                onClick={handleSignOut}
                                className="w-full p-3 text-left hover:bg-accent/50 rounded-lg transition-colors flex items-center gap-3 text-muted-foreground"
                            >
                                <div className="p-2 bg-gray-50 text-gray-600 rounded-lg dark:bg-gray-800">🚪</div>
                                <span className="font-medium">{t('logOut')}</span>
                            </button>

                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="w-full p-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-3 text-red-600"
                            >
                                <div className="p-2 bg-red-50 text-red-600 rounded-lg dark:bg-red-900/30">🗑️</div>
                                <span className="font-medium">Delete Account</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Delete Modal Overlay */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-card text-card-foreground rounded-xl p-6 w-full max-w-sm shadow-xl">
                            <h3 className="text-lg font-bold mb-2">Delete Account</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                This action is irreversible. All your data will be lost.
                            </p>
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="Type DELETE to confirm"
                                className="w-full px-3 py-2 border border-input rounded-lg mb-4 bg-background focus:ring-2 focus:ring-destructive outline-none"
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
                                    className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 disabled:opacity-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
