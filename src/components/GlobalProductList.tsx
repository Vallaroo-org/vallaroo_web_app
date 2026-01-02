import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, ShoppingCart, Check, Loader2, MapPin, Heart, Share2, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getProductCategories, getProductSubCategories, type ProductCategory, type ProductSubCategory } from '../app/actions/get-categories';
import { getProducts, type Product as ActionProduct, type SortOption } from '../app/actions/get-products';
import { useLocation } from '../context/LocationContext';
import { getDrivingDistances } from '../lib/locationService';
import { useWishlist } from '../context/WishlistContext';

interface Product extends ActionProduct {
    distance?: string;
}

interface GlobalProductListProps {
    initialProducts?: Product[];
    searchMode?: boolean;
    title?: string;
}

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
            <div className="bg-card text-card-foreground rounded-lg overflow-hidden border border-border/30 hover:shadow-md hover:border-primary/20 transition-all duration-200 h-full flex flex-col relative">
                {/* Image Section - More compact aspect ratio */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    {product.image_urls?.[0] ? (
                        <div className="w-full h-full relative">
                            {/* Using next/image would be better but keeping current img tag structure for minimal diff */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={product.image_urls[0]}
                                alt={productName}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full w-full bg-secondary/30 text-muted-foreground">
                            <span className="text-sm">No Image</span>
                        </div>
                    )}

                    {/* Discount Badge - Only if Discount Exists */}
                    {hasDiscount && discountPercent > 0 && (
                        <div className="absolute top-1.5 left-1.5 z-10">
                            <span className="bg-green-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                                {discountPercent}% OFF
                            </span>
                        </div>
                    )}

                    {/* Action Buttons Overlay - Simplified */}
                    <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 z-20">
                        {/* Wishlist Button */}
                        <button onClick={toggleWishlist} className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all shadow-sm"
                            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                        </button>
                    </div>

                    {/* Distance Badge */}
                    {/* Distance Badge */}
                    {product.distance && (
                        <div
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (product.shops?.latitude && product.shops?.longitude) {
                                    window.open(`https://www.google.com/maps/search/?api=1&query=${product.shops.latitude},${product.shops.longitude}`, '_blank');
                                }
                            }}
                            className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium z-10 border border-white/10 cursor-pointer hover:bg-black/80 transition-colors"
                            title="View on Google Maps"
                        >
                            <MapPin className="w-3 h-3 text-primary" />
                            <span>{product.distance} km</span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-3 flex flex-col flex-1 bg-card">
                    {/* Product Name - Shop name as tooltip */}
                    <h3
                        className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-2 capitalize min-h-[2.5rem]"
                        title={`From ${shopName}`}
                    >
                        {productName}
                    </h3>

                    {/* Price & Action - Clean layout */}
                    <div className="mt-auto flex items-center justify-between gap-2">
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-base sm:text-lg text-foreground">{formatPrice(product.price)}</span>
                            {hasDiscount && (
                                <span className="text-xs text-muted-foreground line-through">
                                    {formatPrice(mrp)}
                                </span>
                            )}
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${isAdded
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                                }`}
                        >
                            {isAdded ? <Check className="w-4 h-4" /> : 'ADD'}
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
    onViewAll,
    index
}: {
    category: string;
    onViewAll: (category: string) => void;
    index: number;
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    // Initially true for first 2 sections (above fold), false for others
    const [shouldFetch, setShouldFetch] = useState(index < 2);
    const { latitude, longitude } = useLocation();
    const sectionRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for Lazy Loading
    useEffect(() => {
        if (shouldFetch) return; // Already fetching/fetched

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setShouldFetch(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '200px', // Fetch when 200px away from viewport
                threshold: 0.1
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [shouldFetch]);

    useEffect(() => {
        if (!shouldFetch) return;

        const fetchSectionProducts = async () => {
            try {
                // Fetch limited items (e.g. 5) for this category
                const result = await getProducts({
                    page: 1,
                    limit: 10, // enough for a nice scroll
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
    }, [category, latitude, longitude, shouldFetch]);

    if (!shouldFetch) {
        // Render a placeholder with min-height to allow intersection
        return <div ref={sectionRef} className="py-8 min-h-[300px]" />;
    }

    if (loading) return (
        <div ref={sectionRef} className="py-6 space-y-4 min-h-[300px]">
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
        <section className="py-8 border-b border-border/40 last:border-0 animate-in fade-in duration-700">
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

const GlobalProductList = ({ initialProducts = [], searchMode = false, title }: GlobalProductListProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlSearchTerm = searchParams.get('search') || '';
    const debouncedSearch = useDebounce(urlSearchTerm, 300);

    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    // Derived from URL
    const selectedCategory = searchParams.get('category') || 'all';
    const selectedSubCategory = searchParams.get('subcategory') || searchParams.get('sub_category') || 'all';

    // Metadata State
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [subCategories, setSubCategories] = useState<ProductSubCategory[]>([]);

    // Fetch Global Categories on Mount
    useEffect(() => {
        const fetchCats = async () => {
            const data = await getProductCategories();
            setCategories(data);
        };
        fetchCats();
    }, []);

    // Fetch Sub-Categories when Main Category changes
    useEffect(() => {
        const fetchSubCats = async () => {
            if (selectedCategory && selectedCategory !== 'all') {
                // Find ID of selected Category (by name match for now, assuming URL uses name)
                const cat = categories.find(c => c.name.toLowerCase() === decodeURIComponent(selectedCategory).toLowerCase());
                if (cat) {
                    const subs = await getProductSubCategories(cat.id);
                    setSubCategories(subs);
                } else {
                    setSubCategories([]);
                }
            } else {
                setSubCategories([]);
            }
        };

        if (categories.length > 0) {
            fetchSubCats();
        }
    }, [selectedCategory, categories]);

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const observerTarget = useRef<HTMLDivElement>(null);
    const hasInitiallyLoaded = useRef(false);
    const { t, locale } = useLanguage();

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
                // Only pass category (sub-category) if it's selected and we are not in Home View (which is implicitly handled)
                // Actually, logic below handles Home View return. 
                // If sub-category picked, pass it to 'category' param of getProducts
                category: selectedSubCategory !== 'all' ? selectedSubCategory : undefined,
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
    }, [page, debouncedSearch, sortBy, selectedCategory, selectedSubCategory, isHomeView]);

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
    }, [debouncedSearch, sortBy, selectedCategory, selectedSubCategory]);

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
            params.delete('sub_category');
        } else {
            params.set('category', category);
            params.delete('sub_category'); // Reset sub-category when changing main
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const updateSubCategory = (subCategory: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (subCategory === 'all') {
            params.delete('sub_category');
        } else {
            params.set('sub_category', subCategory);
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleViewAll = (category: string) => {
        updateCategory(category);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div>
            {!searchMode && (
                <div className="flex flex-col gap-2 mb-4">
                    {/* Sub-categories removed - now handled by StickyCategoryBar */}
                </div>
            )}

            {/* MAIN CONTENT AREA */}
            <div className={searchMode ? "py-4" : ""}>
                {title && products.length > 0 && <h2 className="text-2xl font-semibold tracking-tight mb-6">{title}</h2>}
                {
                    isHomeView ? (
                        // SECTIONS VIEW (Airbnb Style)
                        <div className="space-y-4">
                            {/* Only show categories that we fetched */}
                            {categories.map((cat, index) => (
                                <CategorySection
                                    key={cat.id}
                                    category={cat.name}
                                    onViewAll={handleViewAll}
                                    index={index}
                                />
                            ))}

                            {/* Fallback check: if no products loaded in any section? 
                        CategorySection handles its own empty state (returns null).
                    */}
                        </div>
                    ) : (
                        // GRID VIEW (Existing Logic)
                        <>
                            {(products.length > 0) ? (
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
                                searchMode && !loading ? null : (
                                    <div className="text-center py-12">
                                        {loading ? (
                                            <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" />
                                        ) : (
                                            <p className="text-muted-foreground">{t('noProductsFound') || 'No products found.'}</p>
                                        )}
                                    </div>
                                )
                            )}
                        </>
                    )
                }
            </div>
        </div >
    );
};

export default GlobalProductList;
