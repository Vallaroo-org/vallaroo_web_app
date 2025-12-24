'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

import Navbar from '@/components/Navbar';

export default function MyOrdersPage() {
    const { t, locale } = useLanguage();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    const getLocalizedContent = (item: any, field: string) => {
        if (!item) return '';
        if (locale === 'ml') {
            return item[`${field}_ml`] || item[field];
        }
        return item[field];
    };

    useEffect(() => {
        fetchSession();
    }, []);

    const fetchSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            setUserId(session.user.id);
            fetchOrders(session.user.id);
        } else {
            setLoading(false);
        }
    };

    const fetchOrders = async (uid: string) => {
        setLoading(true);
        // 1. Fetch Orders
        const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select(`
        *,
        shop:shops(name, name_ml, logo_url),
        order_items(
            quantity,
            total,
            product:products(name, name_ml, image_urls)
        )
      `)
            .eq('user_id', uid)
            .order('created_at', { ascending: false });

        if (ordersError) {
            console.error('Error fetching orders:', ordersError);
        }

        // 2. Fetch Bills for this user
        // We now have user_id on bills table for linking.
        let ordersWithBills = ordersData || [];

        if (ordersData && ordersData.length > 0) {
            const { data: billsData } = await supabase
                .from('bills')
                .select('id, metadata')
                .eq('user_id', uid);

            if (billsData && billsData.length > 0) {
                const billMap = new Map();
                billsData.forEach((bill: any) => {
                    // Start by checking if bill is explicitly linked to order via metadata
                    if (bill.metadata?.order_id) {
                        billMap.set(bill.metadata.order_id, bill.id);
                    }
                });

                ordersWithBills = ordersData.map(order => ({
                    ...order,
                    bill_id: billMap.get(order.id)
                }));
            }
        }

        setOrders(ordersWithBills);
        setLoading(false);
    };

    if (loading) return <div className="p-12 text-center text-muted-foreground">{t('loadingOrders')}</div>;

    if (!userId) {
        return (
            <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl font-bold mb-2">{t('pleaseSignIn')}</h2>
                        <p className="text-muted-foreground mb-4">{t('loginToViewOrders')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
            <Navbar />
            <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold text-foreground mb-6">{t('myOrders')}</h1>

                    <div className="space-y-6">
                        {orders.length === 0 ? (
                            <div className="text-center py-12 bg-card text-card-foreground rounded-xl border border-border shadow-sm">
                                <p className="text-muted-foreground">{t('noOrdersFound')}</p>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div key={order.id} className="bg-card text-card-foreground rounded-xl shadow-sm border border-border overflow-hidden">
                                    {/* Header */}
                                    <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{getLocalizedContent(order.shop, 'name')}</p>
                                            <div className="flex gap-2 text-xs text-muted-foreground">
                                                <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>#{order.id.slice(0, 8)}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    ['ready', 'accepted', 'out_for_delivery'].includes(order.status) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        'bg-muted text-muted-foreground'
                                                }`}>
                                                {order.status === 'out_for_delivery' ? 'Ready' : (t(order.status) || order.status.toUpperCase())}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Items Preview */}
                                    <div className="p-6">
                                        <div className="space-y-4 mb-4">
                                            {order.order_items.slice(0, 3).map((item: any) => (
                                                <div key={item.product.name} className="flex justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-muted-foreground">{item.quantity}x</span>
                                                        <span className="text-foreground">{getLocalizedContent(item.product, 'name')}</span>
                                                    </div>
                                                    <span className="text-muted-foreground">₹{item.total}</span>
                                                </div>
                                            ))}
                                            {order.order_items.length > 3 && (
                                                <p className="text-xs text-muted-foreground italic">...and {order.order_items.length - 3} more items</p>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center pt-4 border-t border-border">
                                            <div>
                                                <p className="text-xs text-muted-foreground">{t('totalAmount')}</p>
                                                <p className="text-xl font-bold text-foreground">₹{order.total_amount}</p>
                                            </div>
                                            {order.bill_id && (
                                                <Link
                                                    href={`/invoice/${order.bill_id}`}
                                                    className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-semibold hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 mr-2"
                                                >
                                                    Invoice
                                                </Link>
                                            )}
                                            <Link
                                                href={`/order?id=${order.id}`}
                                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                            >
                                                {t('viewReceipt')}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
