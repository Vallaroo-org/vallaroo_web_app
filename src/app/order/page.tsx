'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import OrderDetailsClient from '@/components/OrderDetailsClient';
import { getBillId } from '@/app/actions/get-order';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useSearchParams } from 'next/navigation';

function OrderContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('id');
    const [order, setOrder] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            fetchOrder(orderId);
        } else {
            setLoading(false);
        }
    }, [orderId]);

    const [billId, setBillId] = useState<string | null>(null);

    const fetchOrder = async (id: string) => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id, total_amount, customer_name, customer_phone, customer_address, created_at, status,
                    shop:shops (name, logo_url, address_line1, city),
                    order_items (
                        quantity,
                        total,
                        product:products (id, name, price, image_urls)
                    )
                `)
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching order:', error);
            }
            if (data) {
                setOrder(data);

                // Fetch linked bill
                // Try fetching via server action to bypass potential RLS issues for public links
                try {
                    console.log('Fetching bill ID for order:', id);
                    const bid = await getBillId(id);
                    console.log('Bill ID fetched:', bid);
                    if (bid) {
                        setBillId(bid);
                    }
                } catch (e) {
                    console.error('Error fetching bill ID:', e);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-pulse">Loading order details...</div>
            </div>
        );
    }

    if (!orderId) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold mb-2">Invalid Order Link</h1>
                    <p className="text-muted-foreground mb-4">No order ID provided.</p>
                    <Link href="/" className="text-primary hover:underline">Back to Home</Link>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
                    <p className="text-muted-foreground mb-4">The order you are looking for does not exist or you do not have permission to view it.</p>
                    <p className="text-xs text-muted-foreground mb-4">ID: {orderId}</p>
                    <Link href="/" className="text-primary hover:underline">Back to Home</Link>
                </div>
            </div>
        );
    }

    return (
        <main className="flex-1">
            <OrderDetailsClient order={order} billId={billId} />
        </main>
    );
}

export default function OrderPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
            <Navbar />
            <Suspense fallback={
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse">Loading...</div>
                </div>
            }>
                <OrderContent />
            </Suspense>
        </div>
    );
}
