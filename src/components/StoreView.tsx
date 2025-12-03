'use client';

import { useState } from 'react';
import ProductList from './ProductList';
import StoreDetails from './StoreDetails';

interface StoreViewProps {
    store: any;
    products: any[];
}

const StoreView = ({ store, products }: StoreViewProps) => {
    const [activeTab, setActiveTab] = useState<'products' | 'about' | 'gallery'>('products');

    const [copied, setCopied] = useState(false);

    const handleWhatsAppInquiry = () => {
        if (!store.phone_number) return;
        const cleanedNumber = store.phone_number.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(`Hi ${store.name}, I have a query.`)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-background min-h-screen pb-12">
            {/* Hero Section */}
            <div className="relative w-full h-64 sm:h-80 md:h-96 bg-muted overflow-hidden">
                {store.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={store.cover_image_url}
                        alt={`${store.name} cover`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <svg className="w-20 h-20 text-muted-foreground/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-24">
                <div className="bg-background/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 flex flex-col sm:flex-row items-start sm:items-end gap-6">
                    {/* Logo */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-background bg-card shadow-md overflow-hidden flex-shrink-0 -mt-16 sm:-mt-0 relative z-10">
                        {store.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={store.logo_url}
                                alt={store.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-3xl font-bold">
                                {store.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl sm:text-4xl font-bold text-foreground truncate tracking-tight">{store.name}</h1>
                        <p className="text-muted-foreground text-lg">{store.category}</p>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-bold text-yellow-800 border border-yellow-200">
                                ★ {store.rating || 'New'}
                            </span>
                            {store.latitude && store.longitude ? (
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors cursor-pointer hover:underline"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {store.city || 'Local'}
                                </a>
                            ) : (
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {store.city || 'Local'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                        {store.phone_number ? (
                            <a
                                href={`https://wa.me/${store.phone_number.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${store.name}, I have a query.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 sm:flex-none bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                WhatsApp
                            </a>
                        ) : (
                            <button
                                disabled
                                className="flex-1 sm:flex-none bg-muted text-muted-foreground px-5 py-2.5 rounded-xl font-medium cursor-not-allowed flex items-center justify-center gap-2 border border-border"
                                title="Phone number not available"
                            >
                                <svg className="w-5 h-5 grayscale opacity-50" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                WhatsApp
                            </button>
                        )}
                        <button
                            onClick={handleShare}
                            className="flex-1 sm:flex-none border border-input bg-background hover:bg-accent hover:text-accent-foreground px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm"
                        >
                            {copied ? 'Copied!' : 'Share'}
                        </button>
                    </div>
                </div>

                {/* Sticky Tabs */}
                <div className="mt-8 sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border -mx-4 px-4 sm:mx-0 sm:px-0 sm:rounded-t-xl transition-all">
                    <nav className="flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
                        {['products', 'gallery', 'about'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${activeTab === tab
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="mt-6 min-h-[500px]">
                    {activeTab === 'products' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-bold mb-6 tracking-tight">All Products</h2>
                            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                                <ProductList products={products} shop={store} />
                            </div>
                        </div>
                    ) : activeTab === 'gallery' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-bold mb-6 tracking-tight">Gallery</h2>
                            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {/* Cover Image */}
                                    {store.cover_image_url && (
                                        <div className="aspect-square relative rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={store.cover_image_url} alt="Shop Cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                        </div>
                                    )}
                                    {/* Product Images as Gallery */}
                                    {products.slice(0, 11).map((product) => (
                                        product.image_urls?.[0] && (
                                            <div key={product.id} className="aspect-square relative rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={product.image_urls[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                            </div>
                                        )
                                    ))}
                                </div>
                                {products.length === 0 && !store.cover_image_url && (
                                    <div className="text-center py-12">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <p className="text-muted-foreground">No images available in the gallery.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="lg:col-span-2">
                                <StoreDetails store={store} />
                            </div>
                            <div className="space-y-6">
                                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm sticky top-24">
                                    <h3 className="font-bold text-lg mb-4">Contact Info</h3>
                                    <div className="space-y-4 text-sm">
                                        {store.phone_number && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border text-primary">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground font-medium uppercase">Phone</p>
                                                    <p className="font-medium">{store.phone_number}</p>
                                                </div>
                                            </div>
                                        )}
                                        {store.address_line1 && (
                                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border text-primary mt-0.5">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground font-medium uppercase">Address</p>
                                                    <p className="font-medium leading-relaxed">
                                                        {store.address_line1}
                                                        {store.address_line2 && <>, {store.address_line2}</>}
                                                        <br />
                                                        {store.city}, {store.state} {store.postal_code}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoreView;
