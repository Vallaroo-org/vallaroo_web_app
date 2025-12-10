'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import AddressCard from '@/components/AddressCard';
import AddressForm from '@/components/AddressForm';

import Navbar from '@/components/Navbar';

export default function AddressesPage() {
    const { t } = useLanguage();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);

    useEffect(() => {
        fetchSession();
    }, []);

    const fetchSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            setUserId(session.user.id);
            fetchAddresses(session.user.id);
        } else {
            setLoading(false); // Guest
        }
    };

    const fetchAddresses = async (uid: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('user_id', uid)
            .order('is_default', { ascending: false });

        if (data) setAddresses(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        await supabase.from('user_addresses').delete().eq('id', id);
        if (userId) fetchAddresses(userId);
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

    if (!userId) {
        return (
            <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl font-bold mb-2">Please Sign In</h2>
                        <p className="text-muted-foreground mb-4">You need to be logged in to manage addresses.</p>
                        {/* Link to sign in would go here */}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
            <Navbar />
            <main className="flex-1 p-4 sm:p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-foreground">{t('savedAddresses')}</h1>
                        {!showForm && (
                            <button
                                onClick={() => { setEditingAddress(null); setShowForm(true); }}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
                            >
                                + {t('addNewAddress')}
                            </button>
                        )}
                    </div>

                    {showForm ? (
                        <div className="bg-card text-card-foreground rounded-xl shadow-sm p-6 border border-border">
                            <div className="flex items-center gap-3 mb-4">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="p-1 rounded-full hover:bg-accent transition-colors"
                                    aria-label="Back to addresses"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                                </button>
                                <h2 className="text-lg font-bold">
                                    {editingAddress ? 'Edit Address' : t('addNewAddress')}
                                </h2>
                            </div>
                            <AddressForm
                                key={editingAddress ? editingAddress.id : 'new-address'}
                                userId={userId}
                                initialData={editingAddress}
                                onSuccess={() => { setShowForm(false); fetchAddresses(userId); }}
                                onCancel={() => setShowForm(false)}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {addresses.length === 0 ? (
                                <div className="text-center py-12 bg-card text-card-foreground rounded-xl border border-border">
                                    <p className="text-muted-foreground">No saved addresses yet.</p>
                                </div>
                            ) : (
                                addresses.map(addr => (
                                    <AddressCard
                                        key={addr.id}
                                        address={addr}
                                        onEdit={(a) => { setEditingAddress(a); setShowForm(true); }}
                                        onDelete={handleDelete}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
