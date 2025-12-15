'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getShops, type Shop as ActionShop, type ShopSortOption } from '../app/actions/get-shops';

interface Shop extends ActionShop { }

interface ShopListProps {
    initialShops?: Shop[];
}

const ShopCard = ({ shop }: { shop: Shop }) => {
    const { locale } = useLanguage();

    const getLocalizedContent = (item: any, field: string) => {
        if (!item) return '';
        if (locale === 'ml' && item[`${field}_ml`]) {
            return item[`${field}_ml`];
        }
        return item[field];
    };

    const shopName = getLocalizedContent(shop, 'name');
    const shopCity = getLocalizedContent(shop, 'city') || 'Local Store';

    return (
        <Link href={`/store/${shop.id}`} className="group block h-full">
            <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/50 h-full flex flex-col">
                {/* Banner Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {shop.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={shop.cover_image_url}
                            alt={shopName}
                            className="h-full w-full object-cover transition-transform duration-300 md:group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-muted-foreground/50">
                            <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                    )}
                </div>

                <div className="p-4 flex flex-col flex-1 relative">
                    {/* Logo (Overlapping Banner) */}
                    <div className="absolute -top-10 left-4 h-16 w-16 rounded-full border-4 border-card bg-card overflow-hidden shadow-sm">
                        {shop.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={shop.logo_url}
                                alt={`${shopName} logo`}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground font-bold text-xl">
                                {shopName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold tracking-tight text-lg group-hover:text-primary transition-colors capitalize">{shopName}</h3>
                            <p className="text-sm text-muted-foreground">{shopCity}</p>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center text-xs text-muted-foreground mt-auto pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span>Nearby</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

// Debounce Hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const ShopList = ({ initialShops = [] }: ShopListProps) => {
    const [shops, setShops] = useState<Shop[]>(initialShops);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<ShopSortOption>('newest');

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const debouncedSearch = useDebounce(searchTerm, 500);
    const observerTarget = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

    // Fetch Data Function
    const loadShops = useCallback(async (isNewSearch = false) => {
        setLoading(true);
        try {
            const currentPage = isNewSearch ? 1 : page;
            const result = await getShops({
                page: currentPage,
                limit: 20,
                search: debouncedSearch,
                sortBy: sortBy,
            });

            if (isNewSearch) {
                setShops(result.shops);
                setPage(2);
            } else {
                setShops(prev => [...prev, ...result.shops]);
                setPage(prev => prev + 1);
            }
            setHasMore(result.hasMore);

        } catch (error) {
            console.error("Failed to load shops", error);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, sortBy]);

    // Effect: Search or Sort changed -> Reset and Fetch
    useEffect(() => {
        if (debouncedSearch === '' && sortBy === 'newest' && page === 1 && shops === initialShops) {
            if (initialShops.length > 0) setPage(2);
            return;
        }
        loadShops(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, sortBy]);

    // Effect: Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadShops(false);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loading, loadShops]);

    return (
        <div>
            {/* Header with Search and Sort */}
            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4 items-center">
                {/* Sort */}
                <div className="relative w-full sm:w-48 order-2 sm:order-1">
                    <select
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer transition-shadow"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as ShopSortOption)}
                    >
                        <option value="newest">{t('newest') || 'Newest'}</option>
                        <option value="name_asc">{t('nameAZ') || 'Name: A-Z'}</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64 order-1 sm:order-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t('searchShops') || 'Search shops...'}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {shops.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {shops.map((shop) => (
                            <ShopCard key={shop.id} shop={shop} />
                        ))}
                    </div>

                    {/* Loading Indicator for Infinite Scroll */}
                    {hasMore && (
                        <div ref={observerTarget} className="flex justify-center p-8 w-full">
                            {loading && <Loader2 className="animate-spin h-8 w-8 text-primary" />}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    {loading ? (
                        <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" />
                    ) : (
                        <p className="text-muted-foreground">{t('noShopsFound') || 'No shops found.'}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ShopList;
