'use client';

import { useState, Suspense, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ShopList from '../components/ShopList';
import GlobalProductList from '../components/GlobalProductList';
import GlobalServiceList from '../components/GlobalServiceList';
import FollowingStories from '../components/FollowingStories';
import { MapPin, X, Navigation, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import AdBanner from '../components/AdBanner';
import { useSearchParams } from 'next/navigation';

import { getProducts } from './actions/get-products';
import { getServices } from './actions/get-services';
import { getShops } from './actions/get-shops';
import { Loader2 } from 'lucide-react';

const DiscoverContent = () => {
  const [activeTab, setActiveTab] = useState<'shops' | 'products' | 'services'>('products');
  const { placeName, requestLocation, setManualLocation, permissionStatus, isLoading: isLocationLoading } = useLocation();
  const { t } = useLanguage();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const isSearching = !!searchQuery;
  const [noResults, setNoResults] = useState(false);
  const [isCheckingResults, setIsCheckingResults] = useState(false);

  useEffect(() => {
    const checkResults = async () => {
      if (!isSearching || !searchQuery) {
        setNoResults(false);
        return;
      }

      setIsCheckingResults(true);
      try {
        const [productsRes, servicesRes, shopsRes] = await Promise.all([
          getProducts({ search: searchQuery, limit: 1 }),
          getServices({ search: searchQuery, limit: 1 }),
          getShops({ search: searchQuery, limit: 1 })
        ]);

        const totalResults = productsRes.products.length + servicesRes.services.length + shopsRes.shops.length;
        setNoResults(totalResults === 0);
      } catch (error) {
        console.error("Error checking search results:", error);
        // Fallback to showing lists (they handle errors internally or show nothing)
        setNoResults(false);
      } finally {
        setIsCheckingResults(false);
      }
    };

    checkResults();
  }, [searchQuery, isSearching]);

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      setManualLocation(manualInput.trim());
      setShowLocationModal(false);
      setManualInput('');
    }
  };

  const handleUseCurrentLocation = async () => {
    await requestLocation();
    setShowLocationModal(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-300">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-screen-2xl">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{isSearching ? t('searchResults') || 'Search Results' : t('discoverLocal')}</h1>
              <p className="text-muted-foreground max-w-2xl">
                {isSearching ? `${t('resultsFor') || 'Results for'} "${searchQuery}"` : t('exploreBest')}
              </p>
            </div>

            {/* Location Button - Opens Modal */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium self-start md:self-center"
            >
              <MapPin className="w-4 h-4" />
              {placeName || t('useCurrentLocation')}
            </button>
          </div>

          {/* Ad Banner - Top Carousel */}
          <AdBanner placement="home_top_carousel" className="h-48 md:h-64 mb-6" />

          <FollowingStories />
        </div>

        {/* Tabs - Hide when searching */}
        {!isSearching && (
          <div className="flex gap-4 mb-8 max-w-lg">
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 focus:outline-none focus:ring-2 ring-offset-2 ring-offset-background focus:ring-primary ${activeTab === 'products'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground hover:shadow-sm'
                }`}
            >
              {t('products') || 'Products'}
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 focus:outline-none focus:ring-2 ring-offset-2 ring-offset-background focus:ring-primary ${activeTab === 'services'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground hover:shadow-sm'
                }`}
            >
              {t('services') || 'Services'}
            </button>
            <button
              onClick={() => setActiveTab('shops')}
              className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 focus:outline-none focus:ring-2 ring-offset-2 ring-offset-background focus:ring-primary ${activeTab === 'shops'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground hover:shadow-sm'
                }`}
            >
              {t('shops')}
            </button>
          </div>
        )}

        {/* Ad Banner - Feed Insert */}
        <AdBanner placement="home_feed_insert" className="h-40 md:h-56 mb-8" />

        {/* Content */}
        {isSearching ? (
          <div className="space-y-4">
            {isCheckingResults && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {!isCheckingResults && noResults && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground animate-in fade-in duration-500">
                <div className="bg-muted/50 p-4 rounded-full mb-4">
                  <Search className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{t('noResultsFound') || 'No results found'}</h3>
                <p className="text-sm">We couldn't find any matches for "{searchQuery}". Try adjusting your search.</p>
              </div>
            )}

            {!isCheckingResults && !noResults && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <GlobalProductList
                  searchMode={true}
                  title={t('matchingProducts') || 'Matching Products'}
                />
                <GlobalServiceList
                  searchMode={true}
                  title={t('matchingServices') || 'Matching Services'}
                />
                <ShopList
                  searchMode={true}
                  title={t('matchingShops') || 'Matching Shops'}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            {activeTab === 'shops' ? (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold tracking-tight">{t('nearbyShops')}</h2>
                </div>
                <ShopList />
              </section>
            ) : activeTab === 'services' ? (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold tracking-tight">{t('nearbyServices') || 'Nearby Services'}</h2>
                </div>
                <GlobalServiceList />
              </section>
            ) : (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold tracking-tight">{t('freshFinds')}</h2>
                </div>
                <GlobalProductList />
              </section>
            )}
          </>
        )}
      </main>
      <Footer />

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">{t('changeLocation')}</h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Manual Input */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {t('enterCity')}
                </label>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                  placeholder="e.g., Kanhangad, Kerala"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('change') || 'Set Location'}
              </button>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-sm text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              {/* Use Current Location */}
              <button
                onClick={handleUseCurrentLocation}
                disabled={isLocationLoading || permissionStatus === 'denied'}
                className="w-full py-3 rounded-xl border border-primary text-primary font-semibold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Navigation className="w-4 h-4" />
                {isLocationLoading ? 'Locating...' : permissionStatus === 'denied' ? 'Location Denied' : t('useCurrentLocation')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DiscoverPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <DiscoverContent />
    </Suspense>
  );
};

export default DiscoverPage;