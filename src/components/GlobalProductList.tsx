'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getProducts, type Product as ActionProduct, type SortOption } from '../app/actions/get-products';

interface Product extends ActionProduct { }

interface GlobalProductListProps {
    initialProducts?: Product[];
}

// ProductCard for Global View (shows shop name)
const GlobalProductCard = ({ product }: { product: Product }) => {
    const [isAdded, setIsAdded] = useState(false);
    const { addToCart } = useCart();
    const { locale, t } = useLanguage();

    const getLocalizedContent = (item: any, field: string) => {
        if (!item) return '';
        if (locale === 'ml' && item[`${field}_ml`]) {
            return item[`${field}_ml`];
        }
        return item[field];
    };

    const productName = getLocalizedContent(product, 'name');
    const shopName = product.shops ? getLocalizedContent(product.shops, 'name') : 'Unknown Shop';

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
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
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <Link href={`/product/${product.id}`} className="group block h-full">
            <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/50 h-full flex flex-col relative">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                    {product.image_urls?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={product.image_urls[0]}
                            alt={productName}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary/50 to-muted flex items-center justify-center text-muted-foreground/50">
                            <svg className="w-10 h-10 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </div>
                    )}

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className="absolute bottom-2 right-2 p-2 rounded-full bg-background/90 text-foreground shadow-sm hover:bg-primary hover:text-primary-foreground transition-all 
            opacity-100 translate-y-0
            md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 z-20"
                        title={t('addToCart')}
                    >
                        {isAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    </button>
                </div>
                <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1 capitalize">{productName}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{shopName}</p>

                    <div className="mt-auto flex items-baseline gap-2">
                        <span className="font-bold text-lg text-primary">₹{product.price}</span>
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

const GlobalProductList = ({ initialProducts = [] }: GlobalProductListProps) => {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const debouncedSearch = useDebounce(searchTerm, 500);
    const observerTarget = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

    // Fetch Data Function (Global - no shopId)
    const loadProducts = useCallback(async (isNewSearch = false) => {
        setLoading(true);
        try {
            const currentPage = isNewSearch ? 1 : page;
            const result = await getProducts({
                page: currentPage,
                limit: 20,
                search: debouncedSearch,
                sortBy: sortBy,
                // shopId is NOT passed, making this a global search
            });

            if (isNewSearch) {
                setProducts(result.products);
                setPage(2);
            } else {
                setProducts(prev => [...prev, ...result.products]);
                setPage(prev => prev + 1);
            }
            setHasMore(result.hasMore);

        } catch (error) {
            console.error("Failed to load products", error);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, sortBy]);

    // Effect: Search or Sort changed -> Reset and Fetch
    useEffect(() => {
        if (debouncedSearch === '' && sortBy === 'newest' && page === 1 && products === initialProducts) {
            if (initialProducts.length > 0) setPage(2);
            return;
        }
        loadProducts(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, sortBy]);

    // Effect: Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadProducts(false);
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
    }, [hasMore, loading, loadProducts]);

    return (
        <div>
            {/* Header with Search and Sort */}
            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4 items-center">
                {/* Sort */}
                <div className="relative w-full sm:w-48 order-2 sm:order-1">
                    <select
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer transition-shadow"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                    >
                        <option value="newest">{t('newest') || 'Newest'}</option>
                        <option value="price_asc">{t('priceLowHigh') || 'Price: Low to High'}</option>
                        <option value="price_desc">{t('priceHighLow') || 'Price: High to Low'}</option>
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
                        placeholder={t('searchExample') || 'Search products...'}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {products.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {products.map((product) => (
                            <GlobalProductCard key={product.id} product={product} />
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
                        <p className="text-muted-foreground">{t('noProductsFound') || 'No products found.'}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalProductList;
