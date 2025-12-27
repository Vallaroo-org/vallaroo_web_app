'use client';

import { useState } from 'react';
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
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
                            <svg className="w-20 h-20 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </div>
                    )}

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
                                    className="h-full w-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2 capitalize">{productName}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <svg className="w-4 h-4 flex-shrink-0 translate-y-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        <Link href={`/store/${product.shop_id}`} className="text-sm font-medium hover:text-primary hover:underline transition-colors flex items-center">
                            {shopName}
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
                    <p className="text-sm text-muted-foreground mt-1">{t('inclusiveTaxes')}</p>
                </div>

                <div className="prose prose-sm text-muted-foreground mb-6">
                    <h3 className="text-foreground font-semibold mb-2">{t('description')}</h3>
                    <p>{productDescription || 'No description available for this product.'}</p>
                </div>

                {/* Quantity Selector */}
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

                <div className="mt-auto space-y-4">
                    {/* Add to Cart & Buy Now Row */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 rounded-xl bg-slate-900 dark:bg-slate-100 px-6 py-3 text-base font-bold text-white dark:text-slate-900 shadow-md shadow-slate-900/10 hover:shadow-lg hover:shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[3rem] cursor-pointer"
                        >
                            {isAdded ? (
                                <>
                                    <Check className="w-5 h-5 flex-shrink-0" />
                                    <span>{t('addedToCart')}</span>
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="w-5 h-5 flex-shrink-0" />
                                    <span>{t('addToCart')}</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleBuyNow}
                            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 text-base font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[3rem] cursor-pointer"
                        >
                            <Zap className="w-5 h-5 flex-shrink-0 fill-current" />
                            <span>{t('buyNow') || 'Buy Now'}</span>
                        </button>
                    </div>

                    {/* WhatsApp Inquiry */}
                    {product.shops?.phone_number && (
                        <a
                            href={`https://wa.me/${product.shops.phone_number.replace(/\D/g, '')}?text=${encodeURIComponent(t('inquireProductMsg', {
                                shopName: shopName,
                                productName: productName,
                                link: typeof window !== 'undefined' ? window.location.href : ''
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

