'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileCompletionCheck() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        displayName: '',
        phoneNumber: '',
    });

    const router = useRouter();

    useEffect(() => {
        const checkProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) {
                setLoading(false);
                return;
            }

            setUserId(session.user.id);

            const { data: profile, error } = await supabase
                .from('user_profiles')
                .select('display_name, phone_number')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                // If error (e.g. no profile row), we might want to force create one or just show dialog
                // Safest to show dialog if we can't verify they have data
                setIsOpen(true);
            } else {
                if (!profile?.display_name || !profile?.phone_number) {
                    setFormData({
                        displayName: profile?.display_name || '',
                        phoneNumber: profile?.phone_number || '',
                    });
                    setIsOpen(true);
                }
            }
            setLoading(false);
        };

        checkProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN') {
                checkProfile();
            } else if (event === 'SIGNED_OUT') {
                setIsOpen(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        if (!formData.displayName.trim() || !formData.phoneNumber.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    id: userId,
                    display_name: formData.displayName.trim(),
                    phone_number: formData.phoneNumber.trim(),
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            toast.success('Profile updated successfully');
            setIsOpen(false);
            router.refresh();
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-background w-full max-w-md rounded-lg shadow-xl border border-border overflow-hidden">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-2">Complete Your Profile</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        Please provide your details to continue using Vallaroo. This helps businesses better serve you.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.displayName}
                                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                                className="w-full px-3 py-2 rounded-md border border-input bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                required
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                className="w-full px-3 py-2 rounded-md border border-input bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. 9876543210"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-primary text-primary-foreground font-medium py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                {saving ? 'Saving...' : 'Continue'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
