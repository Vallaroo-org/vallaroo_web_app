'use client';

import { useState, useEffect } from 'react';
import ProductList from './ProductList';
import ServiceList from './ServiceList';
import StoryViewer from './StoryViewer';
import StoreDetails from './StoreDetails';

import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabaseClient';

interface Story {
    id: string;
    media_url: string;
    media_type: string;
}

interface StoreViewProps {
    store: any;
    products: any[];
    services?: any[];
    stories: Story[];
}

const StoreView = ({ store, products, services = [], stories }: StoreViewProps) => {
    const { t, locale } = useLanguage();

    // Determine default active tab based on visibility
    const getInitialTab = () => {
        const hideProducts = store.is_temporarily_closed && store.hide_products_during_closure;
        const hideServices = store.is_temporarily_closed && store.hide_services_during_closure;

        if (store.shop_type === 'service') {
            return !hideServices ? 'services' : 'about';
        }
        if (store.shop_type === 'product') {
            return !hideProducts ? 'products' : 'about';
        }
        // Both
        if (!hideProducts) return 'products';
        if (!hideServices) return 'services';
        return 'about';
    };

    const [activeTab, setActiveTab] = useState<'products' | 'services' | 'about' | 'gallery'>(getInitialTab());
    const [showStories, setShowStories] = useState(false);

    const [copied, setCopied] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Initial check for follow status
    useEffect(() => {
        const checkFollowStatus = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const currentUser = session?.user;
                setUser(currentUser);

                if (currentUser) {
                    const { data, error } = await supabase
                        .from('shop_followers')
                        .select('id')
                        .eq('shop_id', store.id)
                        .eq('follower_id', currentUser.id)
                        .maybeSingle();

                    if (error) {
                        console.error('Error checking follow status:', error);
                    } else {
                        setIsFollowing(!!data);
                    }
                }
            } catch (err) {
                console.error('Unexpected error checking follow status:', err);
            } finally {
                setIsFollowLoading(false);
            }
        };
        checkFollowStatus();
    }, [store.id]);

    const handleFollow = async () => {
        if (!user) {
            // Redirect to login or show auth modal
            // Using window.location.href ensures full reload which might be needed for auth state
            window.location.href = `/signin?redirect=/store/${store.id}`;
            return;
        }

        setIsFollowLoading(true);

        try {
            if (isFollowing) {
                // Unfollow
                const { error } = await supabase
                    .from('shop_followers')
                    .delete()
                    .eq('shop_id', store.id)
                    .eq('follower_id', user.id);

                if (error) {
                    console.error('Error unfollowing:', error);
                    alert('Failed to unfollow. Please try again.');
                } else {
                    setIsFollowing(false);
                }
            } else {
                // Follow
                const { error } = await supabase
                    .from('shop_followers')
                    .insert({
                        shop_id: store.id,
                        follower_id: user.id
                    });

                if (error) {
                    console.error('Error following:', error);
                    alert('Failed to follow. Please try again.');
                } else {
                    setIsFollowing(true);
                }
            }
        } catch (err) {
            console.error('Unexpected error handling follow:', err);
            alert('An unexpected error occurred.');
        } finally {
            setIsFollowLoading(false);
        }
    };

    const getLocalizedContent = (item: any, field: string) => {
        if (!item) return '';
        if (locale === 'ml') {
            return item[`${field}_ml`] || item[field];
        }
        return item[field];
    };

    const handleWhatsAppInquiry = () => {
        if (!store.phone_number) return;
        const cleanedNumber = store.phone_number.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(t('inquireShopMsg', {
            shopName: getLocalizedContent(store, 'name'),
            link: window.location.href
        }))}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const tabs = [];

    if (store.shop_type !== 'service') {
        const hideProducts = store.is_temporarily_closed && store.hide_products_during_closure;
        if (!hideProducts) {
            tabs.push({ id: 'products', label: t('products') });
        }
    }

    if (store.shop_type === 'service' || store.shop_type === 'both') {
        const hideServices = store.is_temporarily_closed && store.hide_services_during_closure;
        if (!hideServices) {
            tabs.push({ id: 'services', label: t('services') || 'Services' });
        }
    }

    tabs.push({ id: 'gallery', label: t('gallery') });
    tabs.push({ id: 'about', label: t('prodInfo') });

    const shopName = getLocalizedContent(store, 'name');
    const shopCity = getLocalizedContent(store, 'city');
    const shopCategory = store.category;

    return (
        <div className="bg-background min-h-screen pb-12">
            {/* Hero Section */}
            <div className="relative w-full h-48 sm:h-80 md:h-96 bg-muted overflow-hidden">
                {store.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={store.cover_image_url}
                        alt={`${shopName} cover`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <svg className="w-20 h-20 text-muted-foreground/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
            </div>

            {/* Temporary Closure Banner */}
            {store.is_temporarily_closed && !store.hide_shop_during_closure && (
                <div className="bg-amber-500 text-white px-4 py-3 text-center relative z-20 shadow-md">
                    <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="font-medium">
                            <span className="font-bold">Temporarily Closed</span>
                            {store.closure_reason ? `: ${store.closure_reason}` : ''}
                            {store.closure_end_date && ` (Back on ${new Date(store.closure_end_date).toLocaleDateString()})`}
                        </p>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-16 sm:-mt-24">
                <div className="bg-background/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-center sm:text-left">
                    {/* Logo - Centered on mobile, absolute overlap adjusted */}
                    <div
                        className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-background bg-card shadow-md overflow-hidden flex-shrink-0 -mt-16 sm:mt-0 relative z-10 ${stories.length > 0 ? 'cursor-pointer p-1 border-transparent bg-gradient-to-tr from-purple-500 to-orange-500' : ''}`}
                        onClick={() => stories.length > 0 && setShowStories(true)}
                    >
                        <div className={`w-full h-full rounded-full overflow-hidden ${stories.length > 0 ? 'border-2 border-background' : ''}`}>
                            {store.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={store.logo_url}
                                    alt={shopName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-3xl font-bold">
                                    {shopName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground truncate tracking-tight">{shopName}</h1>

                        {/* Location Row */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {shopCity || 'Local'}
                            </span>
                            {store.latitude && store.longitude && (
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                                >
                                    {t('openMaps')}
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            )}
                        </div>

                        {/* Rating Badge - only show if no rating (New) */}
                        {!store.rating && (
                            <span className="inline-flex items-center gap-1 mt-3 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/30">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                New
                            </span>
                        )}
                    </div>

                    {/* Actions - Grid on mobile, flex on desktop */}
                    <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                        {store.phone_number ? (
                            <a
                                href={`https://wa.me/${store.phone_number.replace(/\D/g, '')}?text=${encodeURIComponent(t('inquireShopMsg', {
                                    shopName: getLocalizedContent(store, 'name'),
                                    link: typeof window !== 'undefined' ? window.location.href : ''
                                }))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="col-span-2 sm:col-span-1 bg-green-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm"
                            >
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                <span className="truncate">{t('inquireWhatsapp')}</span>
                            </a>
                        ) : (
                            <button
                                disabled
                                className="col-span-2 sm:col-span-1 bg-muted text-muted-foreground px-4 py-2.5 rounded-xl font-medium cursor-not-allowed flex items-center justify-center gap-2 border border-border text-sm"
                                title="Phone number not available"
                            >
                                <svg className="w-4 h-4 flex-shrink-0 grayscale opacity-50" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                <span className="truncate">{t('inquireWhatsapp')}</span>
                            </button>
                        )}
                        <button
                            onClick={handleShare}
                            className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm text-sm"
                        >
                            {copied ? t('copied') : t('share')}
                        </button>

                        <button
                            onClick={handleFollow}
                            disabled={isFollowLoading}
                            className={`border px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 text-sm ${isFollowing
                                ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                                : 'border-primary text-primary hover:bg-primary/10 bg-background'
                                }`}
                        >
                            {isFollowLoading ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : isFollowing ? (
                                <>
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    <span className="truncate">{t('following') || 'Following'}</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    <span className="truncate">{t('follow') || 'Follow'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Sticky Tabs */}
                <div className="mt-8 sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border -mx-4 px-4 sm:mx-0 sm:px-0 sm:rounded-t-xl transition-all">
                    <nav className="flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="mt-6 min-h-[500px]">
                    {activeTab === 'products' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-bold mb-6 tracking-tight">{t('allProducts')}</h2>
                            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                                <ProductList initialProducts={products} shop={store} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-bold mb-6 tracking-tight">{t('services') || 'Services'}</h2>
                            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                                <ServiceList initialServices={services} shop={store} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'gallery' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-bold mb-6 tracking-tight">{t('gallery')}</h2>
                            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">


                                    {/* Shop Gallery Images */}
                                    {store.gallery_urls?.map((url: string, index: number) => (
                                        <div key={`gallery-${index}`} className="aspect-square relative rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt={`Gallery Image ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                        </div>
                                    ))}


                                </div>
                                {(!store.gallery_urls || store.gallery_urls.length === 0) && (
                                    <div className="text-center py-12">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <p className="text-muted-foreground">{t('noImagesInGallery')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="lg:col-span-2">
                                <StoreDetails store={store} />
                            </div>
                            <div className="space-y-6">
                                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm sticky top-24">
                                    <h3 className="font-bold text-lg mb-4">{t('contactInfo')}</h3>
                                    <div className="space-y-4 text-sm">
                                        {store.phone_number && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border text-primary">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground font-medium uppercase">{t('phoneLabel')}</p>
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
                                                    <p className="text-xs text-muted-foreground font-medium uppercase">{t('addressLabel')}</p>
                                                    <p className="font-medium leading-relaxed">
                                                        {getLocalizedContent(store, 'address_line1')}
                                                        {getLocalizedContent(store, 'address_line2') && <>, {getLocalizedContent(store, 'address_line2')}</>}
                                                        <br />
                                                        {shopCity}, {store.state} {store.postal_code}
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

            {showStories && (
                <StoryViewer
                    stories={stories}
                    onClose={() => setShowStories(false)}
                />
            )}
        </div>
    );
};

export default StoreView;
