'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getShops, type Shop as ActionShop, type ShopSortOption } from '../app/actions/get-shops';
import { getShopCategories, type ShopCategory } from '../app/actions/get-shop-categories';
import { useLocation } from '../context/LocationContext';
import { getDrivingDistances, type DistanceResult } from '../lib/locationService';

interface Shop extends ActionShop {
    distance?: string;
}

interface ShopListProps {
    initialShops?: Shop[];
}

const ShopCard = ({ shop }: { shop: Shop }) => {
    const { locale, t } = useLanguage();

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
            <div className="overflow-hidden rounded-xl border border-border/50 bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/20 h-full flex flex-col group-hover:-translate-y-1">
                {/* Banner Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                    {shop.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={shop.cover_image_url}
                            alt={shopName}
                            className="h-full w-full object-cover transition-transform duration-700 md:group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center text-muted-foreground/30">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                </div>

                <div className="p-5 flex flex-col flex-1 relative pt-12">
                    {/* Logo (Overlapping Banner) */}
                    <div className="absolute -top-10 left-5 h-20 w-20 rounded-2xl border-4 border-card bg-card overflow-hidden shadow-md group-hover:shadow-lg transition-all">
                        {shop.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={shop.logo_url}
                                alt={`${shopName} logo`}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl">
                                {shopName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-1 mb-2">
                        <h3 className="font-bold text-xl tracking-tight group-hover:text-primary transition-colors capitalize line-clamp-1">{shopName}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span className="line-clamp-1">{shopCity}</span>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                        {shop.distance ? (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-full">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                <span>{shop.distance} km away</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                                <span>{t('visitStore')}</span>
                            </div>
                        )}

                        <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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
    const [categories, setCategories] = useState<ShopCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    // const [searchTerm, setSearchTerm] = useState(''); // REMOVED
    const searchParams = useSearchParams();
    const urlSearchTerm = searchParams.get('search') || '';
    const [sortBy, setSortBy] = useState<ShopSortOption>('newest');

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const debouncedSearch = useDebounce(urlSearchTerm, 300);
    const observerTarget = useRef<HTMLDivElement>(null);
    const hasInitiallyLoaded = useRef(false);
    const { t, locale } = useLanguage();

    // Location for distance calculation
    const { latitude, longitude } = useLocation();

    useEffect(() => {
        const fetchCategories = async () => {
            const cats = await getShopCategories();
            setCategories(cats);
        };
        fetchCategories();
    }, []);

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
                categoryId: selectedCategory,
            });

            let newShops = result.shops as Shop[];

            if (isNewSearch) {
                setShops(newShops);
                setPage(2);
            } else {
                setShops(prev => {
                    // Check for duplicates before adding
                    const existingIds = new Set(prev.map(s => s.id));
                    const uniqueNewShops = newShops.filter(s => !existingIds.has(s.id));
                    return [...prev, ...uniqueNewShops];
                });
                setPage(prev => prev + 1);
            }
            setHasMore(result.hasMore);

        } catch (error) {
            console.error("Failed to load shops", error);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, sortBy, selectedCategory]);

    // Calculate Distances and Sort logic stays same...

    // ... existing distance effect ...

    // Filter Change Effect
    useEffect(() => {
        // Reset and reload when category changes
        // Only if we're past the initial hydration/load
        // If it's the very first load and we have initialShops, we might skip if category is 'all'
        // But for simplicity, let's treat category change as a new search always

        setShops([]);
        setPage(1);
        setHasMore(true);
        loadShops(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory]);

    // Search/Sort Change Effect
    useEffect(() => {
        // On first render with default values and no initialShops, fetch data
        if (!hasInitiallyLoaded.current && debouncedSearch === '' && sortBy === 'newest' && selectedCategory === 'all' && initialShops.length === 0) {
            hasInitiallyLoaded.current = true;
            // loadShops(true) will be called by category effect above anyway because 'all' is default?
            // Actually category effect runs on mount too because of state init? No, React 18 strict mode maybe.
            // Let's rely on the explicit load if needed, or if category logic covers it.
            // The category logic runs ONCE on mount with 'all'.
            return;
        }

        // ... existing logic adaptation ...
        // Simply trigger load if not handled by category effect (which handles category)
        // Here we handle search/sort

        // This effect might clash with category effect if both change at once?
        // Let's simplify: merge triggers if possible, or accept re-renders.

        hasInitiallyLoaded.current = true;
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
            {/* Header with Sort - Search moved to Navbar */}
            <div className="flex flex-col sm:flex-row justify-end mb-6 gap-4 items-center">
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

                {/* Search removed from here */}
            </div>

            {/* Header with Sort ... */}

            {/* Category Filter Chips */}
            <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-none mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${selectedCategory === 'all'
                        ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                        : 'bg-secondary/50 text-secondary-foreground border-transparent hover:bg-secondary hover:text-foreground'
                        }`}
                >
                    {t('all' as any) || 'All'}
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${selectedCategory === cat.id
                            ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                            : 'bg-secondary/50 text-secondary-foreground border-transparent hover:bg-secondary hover:text-foreground'
                            }`}
                    >
                        {locale === 'ml' ? (cat.name_ml || cat.name) : cat.name}
                    </button>
                ))}
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
