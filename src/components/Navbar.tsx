'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {mounted ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvedTheme === 'dark' ? "/vallaroo-logo-white.png" : "/vallaroo-logo-black.png"}
                alt="Vallaroo"
                className="h-8"
              />
            ) : (
              // Fallback to prevent layout shift during hydration, default to black (light mode)
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/vallaroo-logo-black.png"
                alt="Vallaroo"
                className="h-8"
              />
            )}
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Discover
            </Link>
            <Link
              href="https://vallaroo.com"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Back to Website
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
