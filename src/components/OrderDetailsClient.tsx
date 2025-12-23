'use client';

import Image from 'next/image';
import type { OrderDetail } from '@/app/actions/get-order';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';

interface OrderDetailsClientProps {
    order: OrderDetail;
}

const OrderDetailsClient = ({ order }: OrderDetailsClientProps) => {
    const router = useRouter();
    const { t } = useLanguage();
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const shop = order.shop;
    const customerDetails = order.customer_name ? {
        name: order.customer_name,
        phone: order.customer_phone,
        address: order.customer_address
    } : null;

    // Add this line to force refresh when coming back from other pages if needed, 
    // though router.refresh() handles the immediate update after action.

    const handleCancelOrder = async () => {
        try {
            setIsCancelling(true);
            const { error } = await supabase.rpc('cancel_order', {
                order_id: order.id
            });

            if (error) throw error;

            toast.success('Order cancelled successfully');
            setShowCancelDialog(false);
            router.refresh();
        } catch (error: any) {
            console.error('Error cancelling order:', error);
            toast.error(error.message || 'Failed to cancel order');
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-center" />

            {/* Custom Modal */}
            {showCancelDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-background rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-border animate-in zoom-in-95 duration-200">
                        <div>
                            <h3 className="text-lg font-bold">{t('cancelOrder')}</h3>
                            <p className="text-muted-foreground text-sm mt-2">
                                Are you sure you want to cancel this order? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setShowCancelDialog(false)}
                                disabled={isCancelling}
                                className="px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-colors"
                            >
                                No, Keep Order
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={isCancelling}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                {isCancelling && (
                                    <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {isCancelling ? 'Cancelling...' : `Yes, ${t('cancelOrder')}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto">
                <div className="bg-card text-card-foreground shadow-lg rounded-2xl overflow-hidden border border-border">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-8 text-white print:bg-primary print:from-primary print:to-primary">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold">{t('orderSummary')}</h1>
                                <p className="opacity-90 mt-2">
                                    {t('receiptFrom')} <span className="font-semibold">{shop.name}</span>
                                </p>
                                <p className="text-xs opacity-75 mt-1">Order #{order.id.slice(0, 8)}</p>
                            </div>
                            {order.status === 'pending' && (
                                <button
                                    onClick={() => setShowCancelDialog(true)}
                                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-semibold transition-colors backdrop-blur-sm border border-white/10 shadow-lg"
                                >
                                    {t('cancelOrder')}
                                </button>
                            )}
                        </div>
                    </div>


                    <div className="p-8">
                        {/* Shop Info */}
                        <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-border">
                            {shop.logo_url ? (
                                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-border">
                                    <Image
                                        src={shop.logo_url}
                                        alt={shop.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">{shop.name}</h2>
                                <p className="text-muted-foreground">{shop.location_name || shop.address}</p>
                            </div>
                        </div>

                        {/* Customer Details */}
                        {customerDetails && (
                            <div className="mb-8 p-4 bg-muted/50 rounded-lg">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('customerDetails')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">{t('name')}</p>
                                        <p className="font-medium text-foreground">{customerDetails.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">{t('phone')}</p>
                                        <p className="font-medium text-foreground">{customerDetails.phone}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-muted-foreground">{t('address')}</p>
                                        <p className="font-medium text-foreground">{customerDetails.address}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Items List */}
                        <div className="space-y-6">
                            {order.order_items.map((item) => (
                                <div
                                    key={item.product.id}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                            {item.product.image_urls?.[0] ? (
                                                <Image
                                                    src={item.product.image_urls[0]}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-muted rounded-lg p-2 font-mono font-bold text-muted-foreground">
                                            {item.quantity}x
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-foreground">{item.product.name}</h3>
                                            <p className="text-sm text-muted-foreground">₹{item.product.price} per unit</p>
                                        </div>
                                    </div>
                                    <div className="font-semibold text-foreground">₹{item.total}</div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="border-t border-border mt-8 pt-8 flex justify-between items-center">
                            <span className="text-lg font-medium text-muted-foreground">{t('totalAmount')}</span>
                            <span className="text-3xl font-bold text-green-600 dark:text-green-500">
                                ₹{order.total_amount}
                            </span>
                        </div>

                        <div className="mt-8 text-center text-sm text-muted-foreground print:hidden">
                            <p>Order details generated by Vallaroo.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsClient;
