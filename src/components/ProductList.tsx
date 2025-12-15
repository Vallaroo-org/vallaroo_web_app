'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Share2, MessageCircle, ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getProducts, type Product as ActionProduct, type SortOption } from '../app/actions/get-products';

// Interface matching the Action's return type + UI needs
interface Product extends ActionProduct { }

interface Shop {
  id: string;
  name: string;
  whatsapp_number?: string;
  logo_url?: string;
}

interface ProductListProps {
  initialProducts: Product[];
  shop: Shop;
}

const ProductCard = ({ product, shop }: { product: Product; shop: Shop }) => {
  const [selectedImage, setSelectedImage] = useState(product.image_urls?.[0] || null);
  const [copied, setCopied] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const addingRef = useRef(false);
  const router = useRouter();
  const { addToCart } = useCart();
  const { locale, t } = useLanguage();

  const getLocalizedContent = (item: any, field: string) => {
    if (!item) return '';
    // If current locale is Malayalam ('ml') and we have a value, use it.
    // Fallback to English/default field if ml content is missing.
    if (locale === 'ml' && item[`${field}_ml`]) {
      return item[`${field}_ml`];
    }
    return item[field];
  };

  const shopName = getLocalizedContent(shop, 'name');
  const productName = getLocalizedContent(product, 'name');
  const productDesc = getLocalizedContent(product, 'description');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Guard using useRef
    if (addingRef.current) {
      return;
    }

    addingRef.current = true;

    addToCart({
      productId: product.id,
      quantity: 1,
      shopId: shop.id,
      shopName: shopName,
      shopPhone: shop.whatsapp_number,
      shopLogo: shop.logo_url,
      productName: productName,
      price: product.price,
      imageUrl: product.image_urls?.[0],
    });

    setIsAdded(true);

    // Reset guard immediately
    setTimeout(() => {
      addingRef.current = false;
    }, 100);

    // Reset visual feedback after 2s
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleInquire = (e: React.MouseEvent) => {
    e.stopPropagation();
    const baseUrl = 'https://app.vallaroo.com';
    const productLink = `${baseUrl}/product/${product.id}`;
    const whatsappMessage = encodeURIComponent(`I'm interested in your product: ${product.name}. More details: ${productLink}`);

    if (!shop.whatsapp_number) return;
    const cleanedWhatsappNumber = shop.whatsapp_number.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanedWhatsappNumber.startsWith('91') ? cleanedWhatsappNumber : '91' + cleanedWhatsappNumber}?text=${whatsappMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const baseUrl = 'https://app.vallaroo.com';
    const productLink = `${baseUrl}/product/${product.id}`;
    navigator.clipboard.writeText(productLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCardClick = () => {
    router.push(`/product/${product.id}`);
  };

  const hasWhatsapp = !!shop.whatsapp_number;

  return (
    <div
      className="bg-card text-card-foreground rounded-2xl border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Aspect ratio fixed to something consistent, e.g. 4/5 or Square */}
      <div className="relative w-full aspect-[4/5] bg-muted/50 flex items-center justify-center overflow-hidden">
        {selectedImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selectedImage}
            alt={productName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground/50">
            <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-sm font-medium">No Image</span>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-4 group-hover:translate-x-0">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground shadow-sm hover:bg-background transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow space-y-2">
          {/* Capitalized, Bold Name */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-bold leading-tight line-clamp-2 capitalize group-hover:text-primary transition-colors">{productName}</h3>
          </div>
          <span className="text-lg font-bold text-primary whitespace-nowrap block">₹{product.price.toFixed(0)}</span>
          <p className="text-sm text-muted-foreground line-clamp-2">{productDesc}</p>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row gap-2 w-full">
          {/* Stack on mobile, side-by-side on larger screens */}
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-secondary text-secondary-foreground px-4 py-2.5 rounded-xl hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
          >
            <ShoppingCart className="w-4 h-4 flex-shrink-0" />
            <span>{t('addToCart') || 'Add to Cart'}</span>
          </button>
          <button
            onClick={handleInquire}
            disabled={!hasWhatsapp}
            className={`flex-1 px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 font-medium text-sm ${hasWhatsapp
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
              }`}
          >
            <MessageCircle className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{hasWhatsapp ? 'WhatsApp' : 'No WhatsApp'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for Debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const ProductList = ({ initialProducts = [], shop }: ProductListProps) => {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  // const [selectedCategory, setSelectedCategory] = useState('all'); // Removed strict category filtering for now as data structure is unclear

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const observerTarget = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // Reset function
  const resetList = () => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  };

  // Fetch Data Function
  const loadProducts = useCallback(async (isNewSearch = false) => {
    setLoading(true);
    try {
      const currentPage = isNewSearch ? 1 : page;
      const result = await getProducts({
        shopId: shop.id,
        page: currentPage,
        limit: 20,
        search: debouncedSearch,
        sortBy: sortBy,
      });

      if (isNewSearch) {
        setProducts(result.products);
        setPage(2); // Next page will be 2
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
  }, [shop.id, page, debouncedSearch, sortBy]);


  // Effect: Search or Sort changed -> Reset and Fetch
  useEffect(() => {
    // Determine if we need to fetch. 
    // We fetch if search changes (debounced) or sort changes.
    // We do NOT fetch initially if initialProducts are passed, UNLESS search/sort differs from default.
    // However, to keep it simple and consistent with "Server Side Search", 
    // we can trigger a fetch when these change.

    // Check if it's the initial render matching props (empty search, newest sort)
    // If so, we might not need to fetch immediately, but since we want to handle pagination correctly
    // from point 0, let's just re-fetch to ensure sync or handle 'load more' correctly.
    // Actually, handling `initialProducts` with pagination logic is tricky if we don't know the cursor.
    // Strategy: Use initialProducts for first render. If Search/Sort changes, replace list.
    // If scrolling, append.

    // To simplify: If search/sort is default, we assume initialProducts is Page 1.
    // If changed, we fetch Page 1.

    if (debouncedSearch === '' && sortBy === 'newest' && page === 1 && products === initialProducts) {
      // Initial state, do nothing
      // Except update page to 2 if we have items?
      if (initialProducts.length > 0) setPage(2);
      return;
    }

    // If search/sort changed (or we are not in initial state), fetch page 1
    // We only trigger this effect if debouncedSearch or sortBy specifically changes.
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
      { threshold: 0.1 } // Load when 10% visible
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
        {/* Sort (Left/Top on mobile) or Filters */}
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

        {/* Search (Right as requested) */}
        <div className="relative w-full sm:w-64 order-1 sm:order-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('searchExample')}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} shop={shop} />
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
            <p className="text-muted-foreground">{t('noProductsMatched') || 'No products found.'}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;
