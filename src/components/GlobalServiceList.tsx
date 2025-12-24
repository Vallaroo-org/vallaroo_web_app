'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getServices, type Service as ActionService } from '../app/actions/get-services';
import { getServiceCategories, type ServiceCategory } from '../app/actions/get-service-categories';
import Link from 'next/link';
import { MapPin, Loader2, Store } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { getDrivingDistances } from '../lib/locationService';

interface Service extends ActionService {
    distance?: string;
    shop?: {
        id: string;
        name: string;
        city?: string;
        logo_url?: string;
        latitude?: number;
        longitude?: number;
    }
}

const ServiceCard = ({ service }: { service: Service }) => {
    const { locale } = useLanguage();

    const getLocalizedContent = (item: any, field: string) => {
        if (!item) return '';
        if (locale === 'ml' && item[`${field}_ml`]) {
            return item[`${field}_ml`];
        }
        return item[field];
    };

    const serviceName = getLocalizedContent(service, 'name');
    const shopName = service.shop ? getLocalizedContent(service.shop, 'name') : '';
    const city = service.shop?.city;

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Link href={`/service/${service.id}`} className="group block h-full">
            <div className="bg-card text-card-foreground rounded-xl border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col h-full overflow-hidden hover:-translate-y-1">
                {/* Image */}
                <div className="relative w-full aspect-video bg-muted flex items-center justify-center overflow-hidden">
                    {service.image_urls?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={service.image_urls[0]}
                            alt={serviceName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground/50">
                            <svg className="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                    )}
                    {/* Shop Badge Over Image */}
                    {service.shop && (
                        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1.5 rounded-lg text-xs truncate">
                            {service.shop.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={service.shop.logo_url} alt="" className="w-5 h-5 rounded-full object-cover bg-white" />
                            ) : (
                                <Store className="w-4 h-4" />
                            )}
                            <span className="truncate flex-1 font-medium">{shopName}</span>
                        </div>
                    )}
                </div>

                <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-semibold text-base leading-tight line-clamp-2 capitalize group-hover:text-primary transition-colors mb-2">{serviceName}</h3>

                    <div className="mt-auto flex items-center justify-between">
                        <span className="font-bold text-lg text-primary">{formatPrice(service.price)}</span>
                        <div className="flex flex-col items-end gap-1">
                            {service.distance && (
                                <div className="flex items-center gap-1 text-xs text-white bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                                    <MapPin className="w-3 h-3 text-primary" />
                                    <span>{service.distance} km</span>
                                </div>
                            )}
                            {city && !service.distance && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate max-w-[80px]">{city}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const GlobalServiceList = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observerTarget = useRef<HTMLDivElement>(null);
    const { t, locale } = useLanguage();
    const { latitude, longitude } = useLocation();

    useEffect(() => {
        const fetchCategories = async () => {
            const cats = await getServiceCategories();
            setCategories(cats);
        };
        fetchCategories();
    }, []);

    const loadServices = useCallback(async (isNewSearch = false) => {
        if (loading || (!hasMore && !isNewSearch)) return;
        setLoading(true);
        try {
            const result = await getServices({
                page: isNewSearch ? 1 : page,
                limit: 20,
                sortBy: 'newest',
                categoryId: selectedCategory,
            });

            if (isNewSearch) {
                setServices(result.services);
                setPage(2);
            } else {
                setServices(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newUnique = result.services.filter(p => !existingIds.has(p.id));
                    return [...prev, ...newUnique];
                });
                setPage(prev => prev + 1);
            }
            setHasMore(result.hasMore);
        } catch (error) {
            console.error("Failed to load services", error);
        } finally {
            setLoading(false);
        }
    }, [page, hasMore, loading, selectedCategory]);

    // Calculate Distances
    useEffect(() => {
        const calculateDistances = async () => {
            if (latitude && longitude && services.length > 0) {
                const shopsToLocate = new Map();

                services.forEach(p => {
                    if (!p.distance && p.shop && p.shop.latitude && p.shop.longitude) {
                        shopsToLocate.set(p.shop.id, {
                            id: p.shop.id,
                            latitude: p.shop.latitude,
                            longitude: p.shop.longitude
                        });
                    }
                });

                if (shopsToLocate.size === 0) return;

                const shopsArray = Array.from(shopsToLocate.values());
                const distances = await getDrivingDistances(latitude, longitude, shopsArray);

                if (Object.keys(distances).length > 0) {
                    setServices(prev => {
                        const updated = prev.map(p => {
                            if (p.shop?.id && distances[p.shop.id]) {
                                return { ...p, distance: distances[p.shop.id] };
                            }
                            return p;
                        });
                        // Optional: Sort by distance if "Nearby" is implied intent
                        // simple sort for now
                        return updated.sort((a, b) => {
                            const distA = a.distance ? parseFloat(a.distance) : Infinity;
                            const distB = b.distance ? parseFloat(b.distance) : Infinity;
                            return distA - distB;
                        });
                    });
                }
            }
        };
        calculateDistances();
    }, [latitude, longitude, services.length]);

    useEffect(() => {
        // Reset list when category changes
        setServices([]);
        setPage(1);
        setHasMore(true);
        loadServices(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory]); // Trigger load on category change

    // Infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadServices();
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
    }, [hasMore, loading, loadServices]);


    return (
        <div>
            {/* Category Filter Chips */}
            <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-none mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                >
                    {t('all' as any) || 'All'}
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            }`}
                    >
                        {locale === 'ml' ? (cat.name_ml || cat.name) : cat.name}
                    </button>
                ))}
            </div>

            {services.length === 0 && !loading ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No services found.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
                        {services.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>

                    {hasMore && (
                        <div ref={observerTarget} className="flex justify-center p-8 w-full">
                            {loading && <Loader2 className="animate-spin h-8 w-8 text-primary" />}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default GlobalServiceList;
