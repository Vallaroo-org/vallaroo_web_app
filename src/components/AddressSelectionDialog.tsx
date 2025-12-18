'use client';

import React, { useState, useEffect } from 'react';
import { Address, NewAddress } from '../types/address';
import { getUserAddresses, deleteAddress } from '../lib/db/address';
import { supabase } from '../lib/supabaseClient';
import AddressForm from './AddressForm';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from 'next-themes';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (address: Address) => void;
}

export default function AddressSelectionDialog({ isOpen, onClose, onSelect }: Props) {
    const { t } = useLanguage();
    const { resolvedTheme } = useTheme();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'add'>('list');
    const [submitting, setSubmitting] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchAddresses();
        }
    }, [isOpen]);

    const fetchAddresses = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const data = await getUserAddresses(user.id);
                setAddresses(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };



    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this address?')) return;
        try {
            await deleteAddress(id);
            setAddresses(addresses.filter(a => a.id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete address');
        }
    };

    if (!isOpen) return null;

    const handleBackdropClick = () => {
        // Prevent closing if adding a new address to avoid data loss
        if (view === 'list') {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={handleBackdropClick}>
            <div className="bg-background w-full sm:max-w-md md:max-w-lg rounded-t-xl sm:rounded-xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-5" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                    <h2 className="font-bold text-lg">
                        {view === 'list' ? 'Select Address' : 'Add New Address'}
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-4 flex-1">
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : view === 'list' ? (
                        <div className="space-y-4">
                            {addresses.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No saved addresses found. Please add one.
                                </div>
                            ) : (
                                addresses.map(addr => (
                                    <div
                                        key={addr.id}
                                        onClick={() => onSelect(addr)}
                                        className="p-4 border border-border rounded-xl hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors relative group"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold uppercase tracking-wider bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                                {addr.name}
                                            </span>
                                            <button
                                                onClick={(e) => handleDelete(addr.id, e)}
                                                className="text-muted-foreground hover:text-destructive p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <h3 className="font-semibold">{addr.recipient_name}</h3>
                                        <p className="text-sm text-muted-foreground">{addr.house_no}, {addr.road_name}</p>
                                        <p className="text-sm text-muted-foreground">{addr.city}, {addr.pincode}</p>
                                        <p className="text-sm text-muted-foreground mt-1">📞 {addr.phone_number}</p>
                                    </div>
                                ))
                            )}

                            <button
                                onClick={() => setView('add')}
                                className="w-full py-3 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-primary font-medium hover:bg-muted/30 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Add New Address
                            </button>
                        </div>
                    ) : (
                        <div className="p-1">
                            {userId ? (
                                <AddressForm
                                    userId={userId}
                                    onSuccess={() => {
                                        fetchAddresses();
                                        setView('list');
                                    }}
                                    onCancel={() => setView('list')}
                                />
                            ) : (
                                <div>Loading user session...</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
