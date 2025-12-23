'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabaseClient';

const INDIAN_STATES = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
    "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

interface AddressFormProps {
    userId: string;
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: any;
}

export default function AddressForm({ userId, onSuccess, onCancel, initialData }: AddressFormProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || 'Home',
        recipient_name: initialData?.recipient_name || '',
        phone_number: initialData?.phone_number || '',
        house_no: initialData?.house_no || '',
        road_name: initialData?.road_name || '',
        landmark: initialData?.landmark || '',
        city: initialData?.city || '',
        state: initialData?.state || '',
        country: initialData?.country || 'India', // Default to India
        pincode: initialData?.pincode || '',
        is_default: initialData?.is_default || false,
    });

    useEffect(() => {
        console.log('AddressForm initialData changed:', initialData);
        if (initialData) {
            setFormData({
                name: initialData.name || 'Home',
                recipient_name: initialData.recipient_name || '',
                phone_number: initialData.phone_number || '',
                house_no: initialData.house_no || '',
                road_name: initialData.road_name || '',
                landmark: initialData.landmark || '',
                city: initialData.city || '',
                state: initialData.state || '',
                country: initialData.country || 'India',
                pincode: initialData.pincode || '',
                is_default: initialData.is_default || false,
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // Handle checkbox separately if we had one, but is_default can be a toggle
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Construct full address text
            const addressComponents = [
                formData.house_no,
                formData.road_name,
                formData.landmark,
                formData.city,
                formData.state,
                formData.country,
                formData.pincode
            ].filter(Boolean); // Remove empty values

            const addressText = addressComponents.join(', ');

            const payload = {
                user_id: userId,
                ...formData,
                address_text: addressText,
            };

            let error;
            if (initialData?.id) {
                // Update
                const { error: err } = await supabase
                    .from('user_addresses')
                    .update(payload)
                    .eq('id', initialData.id);
                error = err;
            } else {
                // Insert
                const { error: err } = await supabase
                    .from('user_addresses')
                    .insert(payload);
                error = err;
            }

            if (error) throw error;
            onSuccess();
        } catch (err: any) {
            alert('Error saving address: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Label (e.g. Home, Work)</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-input bg-background rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground transition-all placeholder:text-muted-foreground"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">{t('recipientName')}</label>
                    <input
                        type="text"
                        name="recipient_name"
                        value={formData.recipient_name}
                        onChange={handleChange}
                        className="w-full border border-input bg-background rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground transition-all placeholder:text-muted-foreground"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">{t('phoneNumber')}</label>
                    <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="w-full border border-input bg-background rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground transition-all placeholder:text-muted-foreground"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">{t('pincode')}</label>
                    <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        className="w-full border border-input bg-background rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground transition-all placeholder:text-muted-foreground"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">{t('address')}</label>
                    <input
                        type="text"
                        name="house_no"
                        placeholder="House No. / Flat"
                        value={formData.house_no}
                        onChange={handleChange}
                        className="w-full border border-input bg-background rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground transition-all placeholder:text-muted-foreground mb-2"
                    />
                    <input
                        type="text"
                        name="road_name"
                        placeholder="Road Name / Area"
                        value={formData.road_name}
                        onChange={handleChange}
                        className="w-full border border-input bg-background rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground transition-all placeholder:text-muted-foreground"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">{t('landmark')}</label>
                    <input
                        type="text"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleChange}
                        className="w-full border border-input bg-background rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground transition-all placeholder:text-muted-foreground"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">{t('city')}</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full border border-input bg-background rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground transition-all placeholder:text-muted-foreground"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">{t('state')}</label>
                    <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full border border-input bg-background rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-foreground transition-all placeholder:text-muted-foreground appearance-none"
                        required
                    >
                        <option value="" disabled>{t('selectState')}</option>
                        {INDIAN_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">{t('country')}</label>
                    <input
                        type="text"
                        name="country"
                        value={formData.country}
                        readOnly
                        className="w-full border border-input bg-muted text-muted-foreground rounded-xl px-4 py-2.5 text-sm outline-none cursor-not-allowed"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
                <input
                    type="checkbox"
                    id="is_default"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                    className="rounded border-input text-primary focus:ring-ring"
                />
                <label htmlFor="is_default" className="text-sm text-foreground">{t('makeDefault')}</label>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-border mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-foreground bg-background border border-input rounded-xl hover:bg-accent hover:text-accent-foreground transition-all"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/25 active:scale-95"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : t('saveAddress')}
                </button>
            </div>
        </form>
    );
}
