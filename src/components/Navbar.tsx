'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from 'next-themes';
import { useEffect, useState, useRef, Suspense } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogIn, MapPin, Heart, Search, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useLocation } from '../context/LocationContext';
import LocationDialog from './LocationDialog';
import { useWishlist } from '../context/WishlistContext';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

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

const SearchBar = ({ className }: { className?: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const { t } = useLanguage();

  useEffect(() => {
    setQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('search', query.trim());
    } else {
      params.delete('search');
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <input
        type="text"
        placeholder={t('searchExample') || "Search for products..."}
        className="w-full pl-4 pr-16 py-2 rounded-full border border-border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        maxLength={50}
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery('');
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
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center gap-4 mx-auto px-4">
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
            <SearchBar className="flex-1" />
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
          <SearchBar />
        </div>

        {/* Mobile Menu & Backdrop */}
        {isMenuOpen && (
          <>
            {/* Backdrop to close menu when clicking outside - Covers entire screen */}
            <div
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px] md:hidden"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Menu Content */}
            <div
              ref={menuRef}
              className={`md:hidden fixed left-0 top-16 w-full border-b border-border px-4 py-6 space-y-6 shadow-xl animate-in slide-in-from-top-2 z-[101] ${resolvedTheme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
                }`}>
              <div className="space-y-4">
                {/* Mobile Location Button */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowLocationDialog(true);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 rounded-md bg-secondary/50 text-foreground border border-border"
                >
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="font-medium truncate">
                    {placeName || t('selectLocation')}
                  </span>
                </button>

                {/* Discover Link Removed */}

                <Link
                  href={user ? "/profile" : "/signin"}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex w-full items-center gap-2 px-4 py-3 text-base font-medium hover:bg-accent rounded-md active:bg-accent/80 transition-colors"
                >
                  {user ? <User className="w-5 h-5 flex-shrink-0" /> : <LogIn className="w-5 h-5 flex-shrink-0" />}
                  <span>{user ? t('myProfile') : t('signIn')}</span>
                </Link>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between px-2">
                <span className="text-sm font-medium text-muted-foreground">{t('settings')}</span>
                <div className="flex gap-4">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Location Dialog Component */}
      <LocationDialog
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
