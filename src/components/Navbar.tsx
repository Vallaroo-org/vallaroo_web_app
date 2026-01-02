'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from 'next-themes';
import { useEffect, useState, useRef, Suspense } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogIn, MapPin, Heart, Search, X, Package, Wrench, Store, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useLocation } from '../context/LocationContext';
import LocationDialog from './LocationDialog';
import { useWishlist } from '../context/WishlistContext';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getSearchSuggestions, type SearchSuggestion } from '../app/actions/get-search-suggestions';
import LocationFilter from './LocationFilter';
import StickyCategoryBar from './StickyCategoryBar';
import { useLocationFilter } from '../context/LocationFilterContext';

// Wishlist Icon with badge
const WishlistIcon = () => {
  const { getWishlistCount } = useWishlist();
  const count = getWishlistCount();

  return (
    <Link href="/wishlist" className="p-2 rounded-full hover:bg-accent transition-colors relative">
      <Heart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 shadow-lg ring-2 ring-red-500/30">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
};

// Cart Icon with badge
const CartIcon = () => {
  const { getCartItemCount } = useCart();
  const count = getCartItemCount();

  return (
    <Link href="/cart" className="p-2 rounded-full hover:bg-accent transition-colors relative">
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 shadow-lg animate-pulse ring-2 ring-red-500/30">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
};

const SearchBar = ({ className, currentTheme }: { className?: string; currentTheme?: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const { t } = useLanguage();
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLFormElement>(null);
  const { selectedState, selectedDistrict, selectedTown } = useLocationFilter();

  useEffect(() => {
    setQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        const results = await getSearchSuggestions(query, {
          state: selectedState || undefined,
          district: selectedDistrict || undefined,
          town: selectedTown || undefined,
        });
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedState, selectedDistrict, selectedTown]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('search', query.trim());
    } else {
      params.delete('search');
    }
    router.push(`/?${params.toString()}`);
  };

  const handleSuggestionClick = (s: SearchSuggestion) => {
    setShowSuggestions(false);
    if (s.type === 'product') {
      router.push(`/product/${s.id}`);
    } else if (s.type === 'service') {
      router.push(`/service/${s.id}`); // Assuming service details page exists
    } else if (s.type === 'shop') {
      router.push(`/store/${s.id}`);
    } else {
      // Category or other - perform search
      setQuery(s.name);
      const params = new URLSearchParams(searchParams.toString());
      params.set('search', s.name);
      router.push(`/?${params.toString()}`);
    }
  };

  return (
    <form ref={searchContainerRef} onSubmit={handleSearch} className={`relative ${className}`}>
      <input
        type="text"
        placeholder={t('searchExample') || "Search for products, services, shops, categories..."}
        className="w-full pl-4 pr-16 py-2 rounded-full border border-border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true);
        }}
        maxLength={50}
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            setSuggestions([]);
            const params = new URLSearchParams(searchParams.toString());
            params.delete('search');
            router.push(`/?${params.toString()}`);
          }}
          className="absolute right-9 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <button
        type="submit"
        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-primary hover:text-white transition-colors text-muted-foreground"
      >
        <Search className="w-4 h-4" />
      </button>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className={`absolute top-full left-0 w-full mt-2 rounded-xl border border-border shadow-xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 ${currentTheme === 'dark' ? 'bg-neutral-900 text-neutral-100' : 'bg-white text-neutral-900'}`}>
          <div className="max-h-[60vh] overflow-y-auto py-1">
            {suggestions.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleSuggestionClick(item)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 cursor-pointer transition-colors border-b last:border-0 border-border/40"
              >
                {/* Icon/Image */}
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    // Fallback Icons based on type
                    item.type === 'shop' ? <MapPin className="w-4 h-4 opacity-50" /> :
                      item.type === 'product' ? <ShoppingCart className="w-4 h-4 opacity-50" /> :
                        <Search className="w-4 h-4 opacity-50" />
                  )}
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium truncate text-sm">{item.name}</span>
                  <span className="text-xs text-muted-foreground truncate capitalize">
                    {item.type} {item.sub_text ? `• ${item.sub_text}` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}

const NavbarContent = () => {
  const { resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Add state for Location Dialog
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  const { placeName } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHomePage = pathname === '/';

  // Tab state from URL
  const currentTab = (searchParams.get('tab') as 'products' | 'services' | 'shops') || 'products';

  // Location filter state
  const {
    selectedState,
    selectedDistrict,
    selectedTown,
    states,
    districts,
    towns,
    isLoadingTowns,
    setSelectedState,
    setSelectedDistrict,
    setSelectedTown,
  } = useLocationFilter();

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const handleTabChange = (tab: 'products' | 'services' | 'shops') => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'products') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    setMounted(true);
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !toggleButtonRef.current?.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Handle scroll for sticky header animation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
        <div className={`container flex max-w-screen-2xl items-center gap-4 mx-auto px-4 transition-all duration-300 ease-in-out ${isScrolled ? 'h-0 opacity-0 overflow-hidden py-0 md:h-16 md:opacity-100 md:visible md:py-0' : 'h-16 opacity-100'}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            {mounted ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvedTheme === 'dark' ? "/vallaroo_dark_mode.png" : "/vallaroo_light_mode.png"}
                alt="Vallaroo"
                className="h-8"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/vallaroo_light_mode.png"
                alt="Vallaroo"
                className="h-8"
              />
            )}
          </Link>

          {/* Desktop Central Area: Location & Search */}
          <div className="hidden md:flex items-center flex-1 gap-4 max-w-3xl mx-auto px-4">
            {/* Location Button */}
            <button
              onClick={() => setShowLocationDialog(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-foreground transition-all border border-border/50 max-w-[200px] flex-shrink-0"
              title={t('selectLocation')}
            >
              <MapPin className="w-4 h-4 text-primary" />
              <span className="truncate text-sm font-medium">
                {placeName || t('selectLocation')}
              </span>
            </button>

            {/* Search Bar - Takes remaining space */}
            <SearchBar className="flex-1" currentTheme={resolvedTheme} />
          </div>

          {/* Right Side: Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
            <LanguageSwitcher />
            <ThemeToggle />
            <WishlistIcon />
            <CartIcon />
            {user ? (
              <Link href="/profile" className="p-2 rounded-full hover:bg-accent transition-colors">
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <Link href="/signin" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer text-sm font-medium">
                {t('signIn')}
              </Link>
            )}
          </div>

          {/* Mobile Right Side: Cart & Hamburger */}
          <div className="flex md:hidden items-center gap-4 ml-auto">
            <WishlistIcon />
            <CartIcon />
            <button
              ref={toggleButtonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 -mr-2 rounded-md hover:bg-accent transition-colors"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? (
                // X Icon
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              ) : (
                // Menu Icon
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="md:hidden border-t border-border/40 px-4 py-2 bg-background/50">
          <SearchBar currentTheme={resolvedTheme} />
        </div>

        {/* Mobile Menu Content */}
        {isMenuOpen && (
          <div ref={menuRef} style={{ backgroundColor: resolvedTheme === 'dark' ? '#000000' : '#ffffff' }} className="absolute top-full left-0 right-0 border-b border-border p-4 md:hidden shadow-xl animate-in fade-in slide-in-from-top-2 flex flex-col gap-2 max-h-[80vh] overflow-y-auto z-50">
            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">{t('profile') || 'My Profile'}</span>
              </Link>
            ) : (
              <Link
                href="/signin"
                className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn className="w-5 h-5" />
                <span className="font-medium">{t('signIn')}</span>
              </Link>
            )}

            <div className="h-px bg-border/50 my-2" />

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <span className="font-medium text-sm">{t('theme')}</span>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <span className="font-medium text-sm">{t('language')}</span>
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </nav >

      {/* Location Filter Row - Mobile only - Moved outside sticky nav to scroll away */}
      < LocationFilter />

      {/* Sticky Category Bar - Desktop - Moved outside sticky nav to scroll away */}
      < StickyCategoryBar />

      {/* Location Dialog Component */}
      < LocationDialog
        isOpen={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
      />
    </>
  );
};

const Navbar = () => {
  return (
    <Suspense fallback={<div className="h-16 border-b border-border/40 bg-background/95" />}>
      <NavbarContent />
    </Suspense>
  );
};

export default Navbar;
