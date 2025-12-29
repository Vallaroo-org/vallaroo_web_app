'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Check, Plus, Minus, Heart, Zap } from 'lucide-react';
import type { ProductDetail } from '@/app/actions/get-product';

interface ProductDetailsClientProps {
    product: ProductDetail;
}

const ProductDetailsClient = ({ product }: ProductDetailsClientProps) => {
    const { t, locale } = useLanguage();
    const { addToCart } = useCart();
    const router = useRouter();
    const [isAdded, setIsAdded] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(product.image_urls?.[0] || null);
    const [currentUrl, setCurrentUrl] = useState('');

    useEffect(() => {
        setCurrentUrl(window.location.href);
    }, []);

    const getLocalizedContent = (item: any, field: string) => {
        if (!item) return '';
        if (locale === 'ml') {
            return item[`${field}_ml`] || item[field];
        }
        return item[field];
    };

    const handleAddToCart = () => {
        addToCart({
            productId: product.id,
            quantity: quantity,
            shopId: product.shop_id,
            shopName: product.shops ? getLocalizedContent(product.shops, 'name') : 'Unknown Shop',
            shopLogo: product.shops?.logo_url || undefined,
            shopPhone: product.shops?.phone_number || undefined,
            productName: getLocalizedContent(product, 'name'),
            price: product.price,
            imageUrl: product.image_urls?.[0],
        });

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleBuyNow = () => {
        addToCart({
            productId: product.id,
            quantity: quantity,
            shopId: product.shop_id,
            shopName: product.shops ? getLocalizedContent(product.shops, 'name') : 'Unknown Shop',
            shopLogo: product.shops?.logo_url || undefined,
            shopPhone: product.shops?.phone_number || undefined,
            productName: getLocalizedContent(product, 'name'),
            price: product.price,
            imageUrl: product.image_urls?.[0],
        });
        router.push('/cart');
    };

    const handleWishlist = () => {
        setIsWishlisted(!isWishlisted);
        // TODO: Persist to database when wishlist table is created
    };

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

    // Helper for Indian Currency Formatting
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
    const productName = getLocalizedContent(product, 'name');
    const productDescription = getLocalizedContent(product, 'description');
    const shopName = product.shops ? getLocalizedContent(product.shops, 'name') : 'Unknown Shop';

    // Stock Logic
    const { stock, specifications } = product;
    const isOutOfStock = stock !== undefined && stock !== null && stock <= 0;
    const isLowStock = stock !== undefined && stock !== null && stock > 0 && stock <= (specifications?.min_stock_alert || 5);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
                <div className="aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted relative">
                    {selectedImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={selectedImage}
                            alt={productName}
                            className={`h-full w-full object-cover ${isOutOfStock ? 'grayscale' : ''}`}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
                            <svg className="w-20 h-20 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </div>
                    )}

                    {/* Stock Badges (Top Left) */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                        {isOutOfStock && (
                            <span className="bg-black/80 backdrop-blur-md text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg border border-white/20 flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                {(t as any)('outOfStock') === 'outOfStock' ? 'Out of Stock' : (t as any)('outOfStock')}
                            </span>
                        )}
                        {!isOutOfStock && isLowStock && (
                            <span className="bg-amber-500/90 backdrop-blur-md text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg border border-white/20 flex items-center gap-2 animate-pulse">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {(t as any)('limitedStock') === 'limitedStock' ? 'Limited Stock' : (t as any)('limitedStock')}
                            </span>
                        )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                        onClick={handleWishlist}
                        className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all ${isWishlisted
                            ? 'bg-red-500 text-white'
                            : 'bg-background/90 text-muted-foreground hover:text-red-500'
                            }`}
                        title={isWishlisted ? t('removeFromWishlist') || 'Remove from Wishlist' : t('addToWishlist') || 'Add to Wishlist'}
                    >
                        <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                </div>
                {product.image_urls && product.image_urls.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {product.image_urls.map((url, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(url)}
                                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 ${selectedImage === url ? 'border-primary' : 'border-transparent'}`}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={url}
                                    alt={`${productName} thumbnail ${index + 1}`}
                                    className={`h-full w-full object-cover ${isOutOfStock ? 'grayscale' : ''}`}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
                <div className="mb-6">
                    {/* Brand Name */}
                    {getLocalizedContent(product, 'brand_name') && (
                        <p className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">
                            {getLocalizedContent(product, 'brand_name')}
                        </p>
                    )}
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2 capitalize">{productName}</h1>
                    <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            <span className="text-sm font-medium">{shopName}</span>
                        </div>
                        <span className="hidden sm:inline text-border">|</span>
                        <Link href={`/store/${product.shop_id}`} className="text-sm font-medium text-primary hover:underline transition-colors flex items-center gap-1 group">
                            <span>{t('visitStore') || 'Visit Store'}</span>
                            <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </Link>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex items-baseline gap-4">
                        <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                        {product.mrp > product.price && (
                            <>
                                <span className="text-xl text-muted-foreground line-through">{formatPrice(product.mrp)}</span>
                                <span className="rounded bg-green-600 px-2 py-1 text-sm font-semibold text-white shadow-sm">
                                    {discount}{t('off')}
                                </span>
                            </>
                        )}
                    </div>
                    <div className="flex gap-4 items-center mt-1">
                        <p className="text-sm text-muted-foreground">{t('inclusiveTaxes')}</p>
                        {getLocalizedContent(product, 'unit') && (
                            <span className="text-sm font-medium bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                                {getLocalizedContent(product, 'unit')}
                            </span>
                        )}
                    </div>
                </div>

                <div className="prose prose-sm text-muted-foreground mb-6">
                    <h3 className="text-foreground font-semibold mb-2">{t('description')}</h3>
                    <p>{productDescription || 'No description available for this product.'}</p>
                </div>

                {/* Specifications Section */}
                {(product.specifications || product.warranty_period || product.manufacturing_date || product.expiry_date) && (
                    <div className="mb-6 border-t border-border pt-6">
                        <h3 className="text-foreground font-semibold mb-4">{t('productDetails') || 'Product Details'}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                            {/* Static Fields */}
                            {product.warranty_period && (
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs uppercase mb-1">{t('warranty')}</span>
                                    <span className="font-medium text-foreground">{product.warranty_period}</span>
                                </div>
                            )}
                            {product.manufacturing_date && (
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs uppercase mb-1">{t('mfgDate')}</span>
                                    <span className="font-medium text-foreground">
                                        {new Date(product.manufacturing_date).toLocaleDateString(locale === 'ml' ? 'en-IN' : 'en-GB', { dateStyle: 'medium' })}
                                    </span>
                                </div>
                            )}
                            {product.expiry_date && (
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs uppercase mb-1">{t('expiryDate')}</span>
                                    <span className="font-medium text-foreground">
                                        {new Date(product.expiry_date).toLocaleDateString(locale === 'ml' ? 'en-IN' : 'en-GB', { dateStyle: 'medium' })}
                                    </span>
                                </div>
                            )}

                            {/* Dynamic Specifications */}
                            {product.specifications && Object.entries(product.specifications).map(([key, value]) => {
                                if (key === 'hide_out_of_stock' || key === 'min_stock_alert') return null; // Skip internal flags
                                if (!value) return null;
                                // Clean up key
                                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                return (
                                    <div key={key} className="flex flex-col">
                                        <span className="text-muted-foreground text-xs uppercase mb-1">{label}</span>
                                        <span className="font-medium text-foreground">{String(value)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Quantity Selector */}
                {!isOutOfStock && (
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-foreground mb-3">{t('quantity') || 'Quantity'}</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden">
                                <button
                                    onClick={decrementQuantity}
                                    className="p-3 hover:bg-muted transition-colors text-foreground disabled:opacity-50 cursor-pointer"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (!isNaN(val) && val > 0) setQuantity(val);
                                        else if (e.target.value === '') setQuantity(1); // fallback or handle empty
                                    }}
                                    className="w-16 text-center font-bold text-lg border-x border-border bg-transparent focus:outline-none focus:ring-1 focus:ring-primary appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                    onClick={incrementQuantity}
                                    className="p-3 hover:bg-muted transition-colors text-foreground cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <span className="text-muted-foreground text-sm">
                                {t('total') || 'Total'}: <span className="font-bold text-foreground">{formatPrice(product.price * quantity)}</span>
                            </span>
                        </div>
                    </div>
                )}

                <div className="mt-auto space-y-4">
                    {/* Add to Cart & Buy Now Row */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className={`flex-1 rounded-xl px-6 py-3 text-base font-bold shadow-md transition-all flex items-center justify-center gap-2 min-h-[3rem] ${isOutOfStock
                                ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-70 shadow-none'
                                : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-slate-900/10 hover:shadow-lg hover:shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'}`}
                        >
                            {isAdded ? (
                                <>
                                    <Check className="w-5 h-5 flex-shrink-0" />
                                    <span>{t('addedToCart')}</span>
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="w-5 h-5 flex-shrink-0" />
                                    <span>
                                        {isOutOfStock ? ((t as any)('outOfStock') === 'outOfStock' ? 'Out of Stock' : (t as any)('outOfStock')) : t('addToCart')}
                                    </span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleBuyNow}
                            disabled={isOutOfStock}
                            className={`flex-1 rounded-xl px-6 py-3 text-base font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 min-h-[3rem] ${isOutOfStock
                                ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50 shadow-none'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-700 shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'}`}
                        >
                            <Zap className="w-5 h-5 flex-shrink-0 fill-current" />
                            <span>{t('buyNow') || 'Buy Now'}</span>
                        </button>
                    </div>

                    {/* WhatsApp Inquiry */}
                    {product.shops?.phone_number && (
                        <a
                            href={`https://wa.me/${(() => {
                                const clean = product.shops.phone_number.replace(/\D/g, '');
                                return clean.length === 10 ? `91${clean}` : clean.startsWith('91') ? clean : `91${clean}`;
                            })()}?text=${encodeURIComponent(t('inquireProductMsg', {
                                shopName: shopName,
                                productName: productName,
                                link: currentUrl
                            }))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 min-h-[3rem]"
                        >
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                            <span>{t('inquireWhatsapp')}</span>
                        </a >
                    )}
                </div >
            </div >
        </div >
    );
};

export default ProductDetailsClient;

