'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingCart, User, LogIn, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useLocation } from '../context/LocationContext';

const Navbar = () => {
  const { resolvedTheme } = useTheme();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { placeName, requestLocation, error: locationError } = useLocation();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

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

  useEffect(() => {
    if (locationError) {
      alert(`Location Error: ${locationError}`);
    }
  }, [locationError]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between mx-auto px-4">
        {/* Left Side: Logo & Desktop Links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            {mounted ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvedTheme === 'dark' ? "/vallaroo-logo-white.png" : "/vallaroo-logo-black.png"}
                alt="Vallaroo"
                className="h-8"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/vallaroo-logo-black.png"
                alt="Vallaroo"
                className="h-8"
              />
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <button
              onClick={requestLocation}
              className="flex items-center gap-1.5 transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer"
              title={placeName || "Set Location"}
            >
              <MapPin className="w-4 h-4" />
              <span className="max-w-[150px] truncate">
                {placeName ? placeName : t('changeLocation')}
              </span>
            </button>
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t('discover')}
            </Link>
            <Link href="https://vallaroo.com" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t('backToWebsite')}
            </Link>
          </div>
        </div>

        {/* Right Side: Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link href="/cart" className="p-2 rounded-full hover:bg-accent transition-colors relative">
            <ShoppingCart className="w-5 h-5" />
          </Link>
          {user ? (
            <Link href="/profile" className="p-2 rounded-full hover:bg-accent transition-colors">
              <User className="w-5 h-5" />
            </Link>
          ) : (
            <Link href="/signin" className="p-2 rounded-full hover:bg-accent transition-colors">
              <LogIn className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Mobile Right Side: Cart & Hamburger */}
        <div className="flex md:hidden items-center gap-4">
          <Link href="/cart" className="p-2 rounded-full hover:bg-accent transition-colors">
            <ShoppingCart className="w-5 h-5" />
          </Link>
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

      {/* Mobile Menu & Backdrop */}
      {isMenuOpen && (
        <>
          {/* Backdrop to close menu when clicking outside - Covers entire screen */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] md:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Content */}
          <div className={`md:hidden fixed left-0 top-16 w-full border-b border-border px-4 py-6 space-y-6 shadow-xl animate-in slide-in-from-top-2 z-50 ${resolvedTheme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
            }`}>
            <div className="space-y-4">
              <button
                onClick={() => { requestLocation(); setIsMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-4 py-3 text-base font-medium hover:bg-accent rounded-md active:bg-accent/80 transition-colors"
              >
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">
                  {placeName ? placeName : t('changeLocation')}
                </span>
              </button>
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium hover:bg-accent rounded-md active:bg-accent/80 transition-colors"
              >
                {t('discover')}
              </Link>
              <Link
                href="https://vallaroo.com"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-base font-medium hover:bg-accent rounded-md active:bg-accent/80 transition-colors"
              >
                {t('backToWebsite')}
              </Link>
              <Link
                href={user ? "/profile" : "/signin"}
                onClick={() => setIsMenuOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-3 text-base font-medium hover:bg-accent rounded-md active:bg-accent/80 transition-colors"
              >
                {user ? <User className="w-5 h-5 flex-shrink-0" /> : <LogIn className="w-5 h-5 flex-shrink-0" />}
                <span>{user ? "My Profile" : "Sign In"}</span>
              </Link>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between px-2">
              <span className="text-sm font-medium text-muted-foreground">Settings</span>
              <div className="flex gap-4">
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
