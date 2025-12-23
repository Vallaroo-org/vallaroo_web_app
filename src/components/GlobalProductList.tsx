import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, ShoppingCart, Check, Loader2, MapPin, Heart, Share2, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getProducts, type Product as ActionProduct, type SortOption } from '../app/actions/get-products';
import { useLocation } from '../context/LocationContext';
import { getDrivingDistances } from '../lib/locationService';
import { useWishlist } from '../context/WishlistContext';

interface Product extends ActionProduct {
    distance?: string;
}

interface GlobalProductListProps {
    initialProducts?: Product[];
}

const PRODUCT_CATEGORIES = ['Grocery', 'Fashion', 'Electronics', 'Health', 'Home', 'Food', 'Other'];

// ProductCard for Global View (shows shop name)
const GlobalProductCard = ({ product, className = "" }: { product: Product, className?: string }) => {
    const [isAdded, setIsAdded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { locale, t } = useLanguage();

    const isWishlisted = isInWishlist(product.id);

    const getLocalizedContent = (item: any, field: string) => {
        if (!item) return '';
        if (locale === 'ml' && item[`${field}_ml`]) {
            return item[`${field}_ml`];
        }
        return item[field];
    };

    const productName = getLocalizedContent(product, 'name');
    const shopName = product.shops ? getLocalizedContent(product.shops, 'name') : 'Unknown Shop';

    // Helper for Indian Currency Formatting
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
            productId: product.id,
            quantity: 1,
            shopId: product.shops?.id || '',
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

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isWishlisted) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

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
            navigator.clipboard.writeText(url).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            });
        }
    };

    // Calculate Discount based on MRP
    const mrp = product.mrp || 0;
    const hasDiscount = mrp > product.price;
    const discountPercent = hasDiscount
        ? Math.round(((mrp - product.price) / mrp) * 100)
        : 0;
    const savedAmount = hasDiscount ? mrp - product.price : 0;

    return (
        <Link href={`/product/${product.id}`} className={`group block h-full ${className}`}>
            <div className="bg-card text-card-foreground rounded-2xl overflow-hidden border border-border/40 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-300 h-full flex flex-col relative group-hover:-translate-y-1">
                {/* Image Section */}
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    {product.image_urls?.[0] ? (
                        <div className="w-full h-full relative">
                            {/* Using next/image would be better but keeping current img tag structure for minimal diff */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={product.image_urls[0]}
                                alt={productName}
                                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full w-full bg-secondary/30 text-muted-foreground">
                            <span className="text-sm">No Image</span>
                        </div>
                    )}

                    {/* Discount Badge - Only if Discount Exists */}
                    {hasDiscount && discountPercent > 0 && (
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
                            <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shadow-md animate-in fade-in zoom-in duration-300">
                                {discountPercent}% OFF
                            </span>
                        </div>
                    )}

                    {/* Action Buttons Overlay */}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-2 z-20">
                        {/* Wishlist Button */}
                        <button onClick={toggleWishlist} className="p-2 sm:p-2.5 rounded-full bg-black/20 backdrop-blur-md hover:bg-white transition-all duration-300 group/heart shadow-sm border border-white/10"
                            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white group-hover/heart:text-red-500'}`} />
                        </button>

                        {/* Share Button */}
                        <button onClick={handleShare} className="p-2 sm:p-2.5 rounded-full bg-black/20 backdrop-blur-md hover:bg-white transition-all duration-300 group/share shadow-sm border border-white/10" title="Share Product">
                            {isCopied ? (<Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />) : (<Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover/share:text-blue-500" />)}
                        </button>
                    </div>

                    {/* Distance Badge */}
                    {product.distance && (
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium z-10 border border-white/10">
                            <MapPin className="w-3 h-3 text-primary" />
                            <span>{product.distance} km</span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-1 bg-card">
                    {/* Shop Name */}
                    <div className="flex justify-between items-start mb-1 text-xs text-muted-foreground/80 font-medium tracking-wide uppercase">
                        <span className="truncate w-full">{shopName}</span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-3 capitalize min-h-[3rem] tracking-tight">
                        {productName}
                    </h3>

                    {/* Price & Action */}
                    <div className="mt-auto flex items-end justify-between pt-3 border-t border-border/40">
                        <div className="flex flex-col min-w-0 flex-1 mr-2">
                            {hasDiscount ? (
                                <div className="flex flex-col items-start gap-1 mb-1 sm:flex-row sm:items-center sm:gap-2 sm:mb-0.5">
                                    <span className="text-xs sm:text-sm text-muted-foreground line-through decoration-red-500/50">
                                        {formatPrice(mrp)}
                                    </span>
                                    {/* Darker green for light mode visibility */}
                                    <span className="text-[10px] font-bold text-white bg-green-600 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                                        Save {formatPrice(savedAmount)}
                                    </span>
                                </div>
                            ) : (
                                <div className="h-4 sm:h-6"></div> // Spacer to keep alignment if no discount
                            )}
                            <span className="font-bold text-lg sm:text-xl text-primary tracking-tight truncate">{formatPrice(product.price)}</span>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 shadow-sm active:scale-95 shrink-0 ${isAdded
                                ? 'bg-green-500 text-white shadow-green-200 dark:shadow-green-900/20'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5'
                                }`}
                            title={t('addToCart')}
                        >
                            {isAdded ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

// Component for a horizontal scrolling section
const CategorySection = ({
    category,
    onViewAll
}: {
    category: string;
    onViewAll: (category: string) => void;
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { latitude, longitude } = useLocation();

    useEffect(() => {
        const fetchSectionProducts = async () => {
            try {
                // Fetch limited items (e.g. 5) for this category
                const result = await getProducts({
                    page: 1,
                    limit: 8, // enough for a nice scroll
                    globalCategory: category,
                    sortBy: 'newest'
                });

                if (result.products.length > 0) {
                    // Update Distances if location available
                    let productsWithDist = result.products as Product[];

                    if (latitude && longitude) {
                        const shopsToLocate = new Map();
                        productsWithDist.forEach(p => {
                            if (!p.distance && p.shops && p.shops.latitude && p.shops.longitude) {
                                shopsToLocate.set(p.shop_id, {
                                    id: p.shop_id,
                                    latitude: p.shops.latitude,
                                    longitude: p.shops.longitude
                                });
                            }
                        });

                        if (shopsToLocate.size > 0) {
                            const shopsArray = Array.from(shopsToLocate.values());
                            const distances = await getDrivingDistances(latitude, longitude, shopsArray);
                            if (Object.keys(distances).length > 0) {
                                productsWithDist = productsWithDist.map(p => {
                                    if (p.shop_id && distances[p.shop_id]) {
                                        return { ...p, distance: distances[p.shop_id] };
                                    }
                                    return p;
                                });
                            }
                        }
                    }
                    setProducts(productsWithDist);
                }
            } catch (err) {
                console.error(`Failed to load ${category} section`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchSectionProducts();
    }, [category, latitude, longitude]);

    if (loading) return (
        <div className="py-6 space-y-4">
            <div className="h-8 bg-muted rounded w-32 animate-pulse"></div>
            <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="min-w-[280px] h-[380px] bg-muted rounded-2xl animate-pulse"></div>
                ))}
            </div>
        </div>
    );

    if (products.length === 0) return null;

    return (
        <section className="py-8 border-b border-border/40 last:border-0">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight">{category}</h2>
                <button
                    onClick={() => onViewAll(category)}
                    className="flex items-center gap-1 text-sm font-semibold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                    View All <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="relative group/carousel">
                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
                    {products.map(product => (
                        <div key={product.id} className="min-w-[260px] max-w-[260px] sm:min-w-[280px] sm:max-w-[280px] snap-start h-full">
                            <GlobalProductCard product={product} />
                        </div>
                    ))}
                    <div className="min-w-[100px] flex items-center justify-center snap-start">
                        <button
                            onClick={() => onViewAll(category)}
                            className="bg-card hover:bg-accent border border-border rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all hover:scale-105"
                        >
                            <ChevronRight className="w-6 h-6 text-foreground" />
                        </button>
                    </div>
                </div>
                {/* Gradient fade on right for overflowing content hint */}
                <div className="absolute right-0 top-0 bottom-6 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none md:block hidden md:group-hover/carousel:opacity-0 transition-opacity" />
            </div>
        </section>
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
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlSearchTerm = searchParams.get('search') || '';
    const debouncedSearch = useDebounce(urlSearchTerm, 300);

    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    // Derived from URL
    const selectedCategory = searchParams.get('category') || 'all';

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const observerTarget = useRef<HTMLDivElement>(null);
    const hasInitiallyLoaded = useRef(false);
    const { t } = useLanguage();

    // Location
    const { latitude, longitude } = useLocation();

    // Determine if we are in "Home View" (Sections) or "Grid View"
    const isHomeView = selectedCategory === 'all' && debouncedSearch === '' && sortBy === 'newest';

    // Fetch Data Function (Grid View)
    const loadProducts = useCallback(async (isNewSearch = false) => {
        if (isHomeView) return; // Don't load main grid if in home view

        setLoading(true);
        try {
            const currentPage = isNewSearch ? 1 : page;
            const result = await getProducts({
                page: currentPage,
                limit: 20,
                search: debouncedSearch,
                sortBy: sortBy,
                globalCategory: selectedCategory,
            });

            const newProducts = result.products as Product[];

            if (isNewSearch) {
                setProducts(newProducts);
                setPage(2);
            } else {
                setProducts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNew = newProducts.filter(p => !existingIds.has(p.id));
                    return [...prev, ...uniqueNew];
                });
                setPage(prev => prev + 1);
            }
            setHasMore(result.hasMore);

        } catch (error) {
            console.error("Failed to load products", error);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, sortBy, selectedCategory, isHomeView]);

    // Calculate Distances for Grid Data
    useEffect(() => {
        const calculateDistances = async () => {
            if (latitude && longitude && products.length > 0 && !isHomeView) {
                const shopsToLocate = new Map();

                products.forEach(p => {
                    if (!p.distance && p.shops && p.shops.latitude && p.shops.longitude) {
                        shopsToLocate.set(p.shop_id, {
                            id: p.shop_id,
                            latitude: p.shops.latitude,
                            longitude: p.shops.longitude
                        });
                    }
                });

                if (shopsToLocate.size === 0) return;

                const shopsArray = Array.from(shopsToLocate.values());
                const distances = await getDrivingDistances(latitude, longitude, shopsArray);

                if (Object.keys(distances).length > 0) {
                    setProducts(prev =>
                        prev.map(p => {
                            if (p.shop_id && distances[p.shop_id]) {
                                return { ...p, distance: distances[p.shop_id] };
                            }
                            return p;
                        })
                    );
                }
            }
        };
        calculateDistances();
    }, [latitude, longitude, products.length, isHomeView]);

    // Effect: Search or Sort changed -> Reset and Fetch (Grid Logic)
    useEffect(() => {
        if (isHomeView) return;

        // If switching TO grid view from home view, trigger load
        hasInitiallyLoaded.current = true;
        loadProducts(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, sortBy, selectedCategory]);

    // Effect: Infinite Scroll (Grid Logic)
    useEffect(() => {
        if (isHomeView) return;

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
    }, [hasMore, loading, loadProducts, isHomeView]);

    const updateCategory = (category: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (category === 'all') {
            params.delete('category');
        } else {
            params.set('category', category);
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleViewAll = (category: string) => {
        updateCategory(category);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div>
            {/* Header with Sort and Categories */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                    {/* Sort Container */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1 justify-end">
                        <div className="relative w-full sm:w-48">
                            <select
                                className="w-full pl-4 pr-10 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer transition-shadow"
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
                    </div>
                </div>

                {/* Global Categories Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                    <button
                        onClick={() => updateCategory('all')}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${(selectedCategory === 'all')
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-muted text-muted-foreground border-border'
                            }`}
                    >
                        All
                    </button>
                    {PRODUCT_CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => updateCategory(cat)}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${(selectedCategory === cat)
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background hover:bg-muted text-muted-foreground border-border'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            {isHomeView ? (
                // SECTIONS VIEW (Airbnb Style)
                <div className="space-y-4">
                    {PRODUCT_CATEGORIES.map(category => (
                        <CategorySection
                            key={category}
                            category={category}
                            onViewAll={handleViewAll}
                        />
                    ))}

                    {/* Fallback check: if no products loaded in any section? 
                        CategorySection handles its own empty state (returns null).
                    */}
                </div>
            ) : (
                // GRID VIEW (Existing Logic)
                <>
                    {products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6 animate-in fade-in duration-500">
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
                </>
            )}
        </div>
    );
};

export default GlobalProductList;
