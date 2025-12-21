'use client';

import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShoppingCart, Check, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function WishlistPage() {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { t, locale } = useLanguage();
    const [addedItems, setAddedItems] = useState<string[]>([]);

    const getLocalizedContent = (item: any, field: string) => {
        if (!item) return '';
        if (locale === 'ml' && item[`${field}_ml`]) {
            return item[`${field}_ml`];
        }
        return item[field];
    };

    const handleAddToCart = (item: any) => {
        const product = item.product;
        const shopName = product.shops ? getLocalizedContent(product.shops, 'name') : 'Unknown Shop';
        const productName = getLocalizedContent(product, 'name');

        addToCart({
            productId: product.id,
            quantity: 1,
            shopId: product.shop_id || '',
            shopName: shopName,
            shopPhone: product.shops?.phone_number,
            shopLogo: product.shops?.logo_url,
            productName: productName,
            price: product.price,
            imageUrl: product.image_urls?.[0],
        });

        setAddedItems(prev => [...prev, item.id]);
        setTimeout(() => {
            setAddedItems(prev => prev.filter(id => id !== item.id));
        }, 2000);
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-screen-xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">{t('wishlist') || 'My Wishlist'}</h1>
                    <span className="text-muted-foreground">{wishlistItems.length} {t('items') || 'items'}</span>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-card rounded-3xl border border-dashed border-border/50">
                        <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">{t('wishlistEmpty') || 'Your wishlist is empty'}</h2>
                        <p className="text-muted-foreground text-center max-w-sm mb-8">
                            {t('wishlistEmptyDesc') || 'Explore our wide selection and find something you love!'}
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            {t('startShopping') || 'Start Shopping'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {wishlistItems.map((item) => {
                            const product = item.product;
                            const shopName = product.shops ? getLocalizedContent(product.shops, 'name') : 'Unknown Shop';
                            const productName = getLocalizedContent(product, 'name');

                            // Discount Logic
                            const mrp = product.mrp || 0;
                            const hasDiscount = mrp > product.price;
                            const discountPercent = hasDiscount
                                ? Math.round(((mrp - product.price) / mrp) * 100)
                                : 0;
                            const savedAmount = hasDiscount ? mrp - product.price : 0;

                            // Formatting
                            const formatPrice = (amount: number) => {
                                return new Intl.NumberFormat('en-IN', {
                                    style: 'currency',
                                    currency: 'INR',
                                    maximumFractionDigits: 0,
                                }).format(amount);
                            };

                            // Share Logic
                            const handleShare = (e: React.MouseEvent) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const url = `${window.location.origin}/product/${product.id}`;
                                if (navigator.share) {
                                    navigator.share({
                                        title: productName,
                                        text: `Check out ${productName} on Vallaroo!`,
                                        url: url,
                                    }).catch(console.error);
                                } else {
                                    navigator.clipboard.writeText(url);
                                    // ideally show toast, but keeping simple
                                }
                            };

                            return (
                                <div key={item.id} className="group relative bg-card text-card-foreground rounded-2xl overflow-hidden border border-border/40 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-300 h-full flex flex-col hover:-translate-y-1">
                                    {/* Image Section */}
                                    <Link href={`/product/${product.id}`} className="relative aspect-[4/5] w-full overflow-hidden bg-muted block">
                                        {(() => {
                                            // Robust image check
                                            const imageUrl = product.image_urls && Array.isArray(product.image_urls) && product.image_urls.length > 0
                                                ? product.image_urls[0]
                                                : null;

                                            return imageUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={imageUrl}
                                                    alt={productName}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    onError={(e) => {
                                                        // Fallback on error
                                                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x500?text=No+Image';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-muted-foreground bg-secondary/30">
                                                    No Image
                                                </div>
                                            );
                                        })()}

                                        {/* Discount Badge */}
                                        {hasDiscount && discountPercent > 0 && (
                                            <div className="absolute top-3 left-3 z-10">
                                                <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md shadow-md animate-in fade-in zoom-in duration-300">
                                                    {discountPercent}% OFF
                                                </span>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                                            {/* Remove from Wishlist (Heart Filled Red) */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    removeFromWishlist(item.id);
                                                }}
                                                className="p-2.5 rounded-full bg-black/20 backdrop-blur-md hover:bg-white transition-all duration-300 group/heart shadow-sm border border-white/10"
                                                title="Remove from Wishlist"
                                            >
                                                {/* Always filled red in wishlist page */}
                                                <svg className="w-4 h-4 fill-red-500 text-red-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                                            </button>

                                            {/* Share Button */}
                                            <button
                                                onClick={handleShare}
                                                className="p-2.5 rounded-full bg-black/20 backdrop-blur-md hover:bg-white transition-all duration-300 group/share shadow-sm border border-white/10"
                                                title="Share"
                                            >
                                                <svg className="w-4 h-4 text-white group-hover/share:text-blue-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                                            </button>
                                        </div>
                                    </Link>

                                    {/* Content */}
                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-1 text-xs text-muted-foreground/80 font-medium tracking-wide uppercase">
                                            <span className="truncate w-full">{shopName}</span>
                                        </div>

                                        <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-3 capitalize min-h-[3rem] tracking-tight">
                                            <Link href={`/product/${product.id}`}>
                                                {productName}
                                            </Link>
                                        </h3>

                                        <div className="mt-auto flex items-end justify-between pt-3 border-t border-border/40">
                                            <div className="flex flex-col">
                                                {hasDiscount ? (
                                                    <div className="flex items-center gap-2 m-0.5">
                                                        <span className="text-sm text-muted-foreground line-through decoration-red-500/50">
                                                            {formatPrice(mrp)}
                                                        </span>
                                                        {/* Darker green for light mode visibility */}
                                                        <span className="text-[10px] font-bold text-white bg-green-600 px-2 py-0.5 rounded shadow-sm">
                                                            saved {formatPrice(savedAmount)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="h-6"></div>
                                                )}
                                                <span className="font-bold text-xl text-primary tracking-tight">{formatPrice(product.price)}</span>
                                            </div>

                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                disabled={addedItems.includes(item.id)}
                                                className={`p-2.5 rounded-xl transition-all duration-300 shadow-sm active:scale-95 ${addedItems.includes(item.id)
                                                    ? 'bg-green-600 text-white shadow-green-200'
                                                    : 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl hover:scale-105'
                                                    }`}
                                                title={t('addToCart') || 'Add to Cart'}
                                            >
                                                {addedItems.includes(item.id) ? (
                                                    <Check className="w-4 h-4" />
                                                ) : (
                                                    <ShoppingCart className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
