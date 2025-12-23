'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, Share2, MessageCircle, Check, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getServices, type Service as ActionService, type SortOption } from '../app/actions/get-services';
import { getServiceCategories, type ServiceCategory } from '../app/actions/get-service-categories';
import Link from 'next/link';

interface Service extends ActionService { }

interface Shop {
    id: string;
    name: string;
    whatsapp_number?: string;
    logo_url?: string;
}

interface ServiceListProps {
    initialServices?: Service[];
    shop: Shop;
}

const ServiceCard = ({ service, shop }: { service: Service; shop: Shop }) => {
    const [copied, setCopied] = useState(false);
    const { locale, t } = useLanguage();

    const getLocalizedContent = (item: any, field: string) => {
        if (!item) return '';
        if (locale === 'ml' && item[`${field}_ml`]) {
            return item[`${field}_ml`];
        }
        return item[field];
    };

    const serviceName = getLocalizedContent(service, 'name');
    const serviceDesc = getLocalizedContent(service, 'description');

    const handleInquire = (e: React.MouseEvent) => {
        e.stopPropagation();
        const whatsappMessage = encodeURIComponent(`I'm interested in your service: ${service.name}.`);

        if (!shop.whatsapp_number) return;
        const cleanedWhatsappNumber = shop.whatsapp_number.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/${cleanedWhatsappNumber.startsWith('91') ? cleanedWhatsappNumber : '91' + cleanedWhatsappNumber}?text=${whatsappMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Assuming simple share of current page + text, as individual service page might not exist yet
        // Or just share the store link with text
        const text = `Check out this service: ${service.name} at ${shop.name}`;
        if (navigator.share) {
            navigator.share({
                title: service.name,
                text: text,
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(`${text} - ${window.location.href}`).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    const hasWhatsapp = !!shop.whatsapp_number;

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
                            <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                    )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                    <div className="flex-1 mb-3">
                        <h3 className="font-semibold text-lg leading-tight line-clamp-2 capitalize group-hover:text-primary transition-colors">{serviceName}</h3>

                        <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {serviceDesc || 'No description available'}
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                            <span className="font-bold text-xl text-primary tracking-tight">{formatPrice(service.price)}</span>
                        </div>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-3 w-full pt-4 border-t border-border/40">
                        <button
                            onClick={handleInquire}
                            disabled={!hasWhatsapp}
                            className={`col-span-1 px-3 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 font-medium text-sm border ${hasWhatsapp
                                ? 'bg-green-600 text-white border-transparent hover:bg-green-700 shadow-sm'
                                : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                                }`}
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span className="truncate">{t('inquire') || 'Inquire'}</span>
                        </button>

                        <button
                            onClick={handleShare}
                            className="col-span-1 px-3 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 font-medium text-sm border bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border/50"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                            <span className="truncate">{copied ? t('copied') : t('share')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const ServiceList = ({ initialServices = [], shop }: ServiceListProps) => {
    const [services, setServices] = useState<Service[]>(initialServices || []);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    useEffect(() => {
        const fetchCategories = async () => {
            const cats = await getServiceCategories();
            setCategories(cats);
        };
        fetchCategories();
    }, []);

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const debouncedSearch = useDebounce(searchTerm, 500);
    const observerTarget = useRef<HTMLDivElement>(null);
    const { t, locale } = useLanguage();

    const loadServices = useCallback(async (isNewSearch = false) => {
        setLoading(true);
        try {
            const currentPage = isNewSearch ? 1 : page;
            const result = await getServices({
                shopId: shop.id,
                page: currentPage,
                limit: 20,
                search: debouncedSearch,
                categoryId: selectedCategory,
                sortBy: sortBy,
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
    }, [shop.id, page, debouncedSearch, sortBy, selectedCategory]);

    useEffect(() => {
        if (debouncedSearch === '' && sortBy === 'newest' && selectedCategory === 'all' && page === 1 && services === initialServices) {
            if (initialServices.length > 0) setPage(2);
            return;
        }
        loadServices(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, sortBy, selectedCategory]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadServices(false);
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
                    onClick={() => setSelectedCategory('all')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                >
                    {t('all' as any) || 'All'}
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                    >
                        {locale === 'ml' ? (cat.name_ml || cat.name) : cat.name}
                    </button>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4 items-center">
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

                <div className="relative w-full sm:w-64 order-1 sm:order-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t('searchServices') || 'Search services...'}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {services.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                        {services.map((service) => (
                            <ServiceCard key={service.id} service={service} shop={shop} />
                        ))}
                    </div>

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
                        <p className="text-muted-foreground">{t('noServicesFound') || 'No services found.'}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ServiceList;
