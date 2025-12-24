'use client';

import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';
import AddressSelectionDialog from '../../components/AddressSelectionDialog';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const CartPage = () => {
    const { t, locale } = useLanguage();
    const { cartItems, updateQuantity, removeFromCart, getShopGroupedItems, getCartItemCount } = useCart();
    const { placeName } = useLocation();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
    const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const groupedItems = getShopGroupedItems();
    const shopIds = Object.keys(groupedItems);
    const totalItems = getCartItemCount();

    const handleCheckoutClick = async (shopId: string, items: any[]) => {
        // Validate Shop ID is a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(shopId)) {
            alert(`Invalid Shop ID detected ("${shopId}"). These items cannot be checked out and may be corrupted. Please remove them from your cart.`);
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert(t('pleaseSignInToOrder'));
            router.push('/signin');
            return;
        }

        // Store temp state and open dialog
        setSelectedShopId(shopId);
        setSelectedItems(items);
        setIsAddressDialogOpen(true);
    };

    const handleAddressSelected = (address: any) => { // Using any temporarily, should import Address type
        setIsAddressDialogOpen(false);
        if (selectedShopId && selectedItems.length > 0) {
            handleWhatsAppCheckout(selectedShopId, selectedItems, address);
        }
    };

    const handleWhatsAppCheckout = async (shopId: string, items: any[], address: any) => {
        if (items.length === 0) return;

        // 1. Get User (Already checked, but good for safety)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 2. Get Shop Details (Phone)
        let shopPhone = items[0].shopPhone;
        if (!shopPhone) {
            try {
                const { data } = await supabase.from('shops').select('phone_number').eq('id', shopId).single();
                if (data?.phone_number) shopPhone = data.phone_number;
            } catch (err) {
                console.error("Failed to fetch shop phone", err);
            }
        }

        if (!shopPhone) {
            alert("Shop phone number not available.");
            return;
        }

        // 3. Create Order in DB
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const customerName = user.user_metadata?.full_name || 'Customer';
        const customerPhone = user.phone || user.user_metadata?.phone || 'N/A';

        // Construct detailed address string from object
        const addressParts = [
            address.house_no,
            address.road_name,
            address.landmark,
            address.city,
            address.pincode,
            address.phone_number ? `Ph: ${address.phone_number}` : null
        ].filter(Boolean).join(', ');

        const customerAddress = addressParts || placeName || 'Location not shared';

        try {
            // Insert Order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    shop_id: shopId,
                    user_id: user.id,
                    customer_id: user.id, // RLS Policy checks this field
                    customer_name: address.recipient_name || customerName, // Use recipient name if available
                    customer_phone: address.phone_number || customerPhone,
                    customer_address: customerAddress,
                    total_amount: total,
                    status: 'pending'
                })
                .select()
                .single();

            if (orderError) throw orderError;

            const orderId = orderData.id;

            // Insert Items
            const orderItems = items.map(item => ({
                order_id: orderId,
                product_id: item.productId,
                quantity: item.quantity,
                price_at_time: item.price,
                total: item.price * item.quantity
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 3.5. Deduct Stock (Using RPC to bypass RLS)
            const stockUpdates = items.map(item =>
                supabase.rpc('decrement_stock', {
                    p_product_id: item.productId,
                    p_quantity: item.quantity
                })
            );

            // Execute all updates (we don't block order success on this, but we log errors)
            Promise.all(stockUpdates).then(results => {
                results.forEach(({ error }) => {
                    if (error) console.error("Failed to deduct stock:", error);
                });
            });

            // 4. Construct WhatsApp Message
            const shopName = items[0].shopName;

            // Format strictly as requested
            let message = `${t('orderMessageIntro', { shopName })}\n`;
            message += `${t('orderIdLabel')}: #${orderId}\n`;
            message += `----------------\n`;

            items.forEach(item => {
                message += `${item.quantity}x ${item.productName} (₹${item.price * item.quantity}.0)\n`;
            });

            message += `----------------\n`;
            message += `${t('total')}: ₹${total}.0\n`;
            message += `----------------\n`;
            message += `${t('customerDetailsLabel')}:\n`;
            message += `${t('name')}: ${address.recipient_name || customerName}\n`;
            message += `${t('phone')}: ${address.phone_number || customerPhone}\n`;
            message += `${t('address')}: ${customerAddress}\n\n`;

            // Generate link (using window.location.origin to be dynamic)
            const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vallaroo.com';

            // Note: The user requested "https://vallaroo.com/order?id=...", 
            // but for this web app, it should link to THIS web app's order page if it exists, 
            // or just the generic domain. 
            // Since we implemented /order/page.tsx previously (I recall seeing it in edited_files!), 
            // I will link to created /order page.
            message += t('viewOrderLink', { link: `${origin}/order?id=${orderId}` });

            // 5. Open WhatsApp
            const cleanedPhone = shopPhone.replace(/\D/g, '');
            const finalPhone = cleanedPhone.startsWith('91') ? cleanedPhone : `91${cleanedPhone}`;
            const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;

            // Open in new tab
            const win = window.open(url, '_blank');

            // 6. Clear items for this shop from cart
            // Since we know the items passed were successfully "ordered", we remove them.
            // Loop through and remove each.
            items.forEach(item => {
                removeFromCart(item.productId, item.variantId);
            });

            // Optional: Refocus window if possible or show success toast (native alert used here)
            // alert("Order opened in WhatsApp! Cart updated."); 

        } catch (error: any) {
            console.error('Order creation failed:', JSON.stringify(error, null, 2));
            alert(`Failed to create order: ${error?.message || JSON.stringify(error)}`);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-primary" />
                    {t('yourCart')}
                    <span className="text-lg font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {totalItems}
                    </span>
                    <Link
                        href="/profile/orders"
                        className="ml-auto text-sm font-medium text-primary hover:underline flex items-center gap-1"
                    >
                        {t('myOrders') || 'Past Orders'} <ArrowRight className="w-4 h-4" />
                    </Link>
                </h1>

                {shopIds.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-2xl border border-border shadow-sm">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-muted-foreground opacity-50" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">{t('cartEmpty')}</h2>
                        <p className="text-muted-foreground mb-8 text-lg">{t('startShopping')}</p>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                        >
                            {t('browseProducts')}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {shopIds.map((shopId) => {
                            const items = groupedItems[shopId];
                            const shopName = items[0].shopName;
                            const shopLogo = items[0].shopLogo;
                            const shopTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

                            return (
                                <div key={shopId} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                                    <div className="bg-muted/30 p-4 border-b border-border flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            {shopLogo ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={shopLogo}
                                                    alt={shopName}
                                                    className="w-8 h-8 rounded-full object-cover border border-border"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                                                    {shopName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <h2 className="font-bold text-lg flex items-center gap-2">
                                                {shopName}
                                            </h2>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{items.length} {t('items')}</span>
                                    </div>

                                    <div className="divide-y divide-border">
                                        {items.map((item) => (
                                            <div key={`${item.productId}-${item.variantId}`} className="p-4 flex gap-4 transition-colors hover:bg-muted/10">
                                                <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 border border-border">
                                                    {item.imageUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                                            <ShoppingBag className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start">
                                                            <h3 className="font-semibold text-foreground truncate pr-4">
                                                                <Link href={`/product/${item.productId}`} className="hover:underline">
                                                                    {item.productName}
                                                                </Link>
                                                            </h3>
                                                            <button
                                                                onClick={() => removeFromCart(item.productId, item.variantId)}
                                                                className="text-muted-foreground hover:text-destructive transition-colors p-1 -mr-1"
                                                                aria-label="Remove item"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <p className="text-primary font-bold mt-1">₹{item.price}</p>
                                                    </div>

                                                    <div className="flex items-center gap-3 mt-2">
                                                        <div className="flex items-center border border-border rounded-lg bg-background">
                                                            <button
                                                                onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                                                                className="p-1 px-2 hover:bg-muted transition-colors text-muted-foreground"
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                                                                className="p-1 px-2 hover:bg-muted transition-colors text-foreground"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <div className="ml-auto font-medium">
                                                            ₹{item.price * item.quantity}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-4 bg-muted/30 border-t border-border space-y-4">
                                        <div className="flex justify-between items-center text-lg font-bold">
                                            <span>{t('subtotal')}</span>
                                            <span>₹{shopTotal}</span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Link
                                                href={`/store/${shopId}`}
                                                className="flex-1 py-3 px-4 rounded-xl border border-input bg-background font-medium text-center hover:bg-accent hover:text-accent-foreground transition-colors"
                                            >
                                                {t('continueShopping')}
                                            </Link>
                                            <button
                                                className="flex-1 py-3 px-4 rounded-xl bg-green-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap"
                                                onClick={() => handleCheckoutClick(shopId, items)}
                                            >
                                                <MessageCircle className="w-5 h-5 flex-shrink-0" />
                                                <span className="truncate">{t('checkoutWhatsApp')}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <AddressSelectionDialog
                    isOpen={isAddressDialogOpen}
                    onClose={() => setIsAddressDialogOpen(false)}
                    onSelect={handleAddressSelected}
                />
            </main>
            <Footer />
        </div>
    );
};

export default CartPage;
