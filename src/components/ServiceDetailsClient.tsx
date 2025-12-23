'use client';

import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MessageCircle, Share2, MapPin, Store, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Service {
    id: string;
    name: string;
    description?: string;
    price: number;
    image_urls?: string[];
    name_ml?: string;
    description_ml?: string;
    shop?: {
        id: string;
        name: string;
        name_ml?: string;
        address_line_1?: string;
        city?: string;
        whatsapp_number?: string;
        logo_url?: string;
        is_verified?: boolean;
    };
}

const ServiceDetailsClient = ({ service }: { service: Service }) => {
    const { locale, t } = useLanguage();
    const [selectedImage, setSelectedImage] = useState(service.image_urls?.[0] || '');
    const [copied, setCopied] = useState(false);

    const getLocalizedContent = (item: any, field: string) => {
        if (!item) return '';
        if (locale === 'ml' && item[`${field}_ml`]) {
            return item[`${field}_ml`];
        }
        return item[field];
    };

    const serviceName = getLocalizedContent(service, 'name');
    const serviceDesc = getLocalizedContent(service, 'description');
    const shopName = service.shop ? getLocalizedContent(service.shop, 'name') : '';

    const handleInquire = () => {
        const whatsappMessage = encodeURIComponent(`Hi ${shopName}, I'm interested in your service: ${service.name}.`);
        if (!service.shop?.whatsapp_number) return;

        const cleanedWhatsappNumber = service.shop.whatsapp_number.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/${cleanedWhatsappNumber.startsWith('91') ? cleanedWhatsappNumber : '91' + cleanedWhatsappNumber}?text=${whatsappMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleShare = () => {
        const text = `Check out this service: ${service.name} at ${shopName}`;
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

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="animate-in fade-in duration-500">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
                <span>/</span>
                <Link href={`/store/${service.shop?.id}`} className="hover:text-primary transition-colors">
                    {shopName}
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium truncate max-w-[200px]">{serviceName}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square bg-muted rounded-2xl overflow-hidden border border-border shadow-sm">
                        {selectedImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={selectedImage}
                                alt={serviceName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50">
                                <svg className="w-20 h-20 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <span className="mt-2 text-sm font-medium">No image available</span>
                            </div>
                        )}
                    </div>

                    {service.image_urls && service.image_urls.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {service.image_urls.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(img)}
                                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-primary' : 'border-transparent hover:border-primary/50'
                                        }`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={img} alt={`${serviceName} ${i + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="flex flex-col">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{serviceName}</h1>

                    <div className="flex items-center justify-between mb-6">
                        <div className="text-3xl font-bold text-primary">{formatPrice(service.price)}</div>
                    </div>

                    <div className="prose prose-sm md:prose-base text-muted-foreground mb-8">
                        <p className="whitespace-pre-line">{serviceDesc}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <button
                            onClick={handleInquire}
                            disabled={!service.shop?.whatsapp_number}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold transition-all shadow-md ${service.shop?.whatsapp_number
                                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20'
                                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                                }`}
                        >
                            <MessageCircle className="w-5 h-5" />
                            {t('inquireWhatsapp') || 'Inquire via WhatsApp'}
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all"
                        >
                            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5" />}
                            {copied ? (t('copied') || 'Copied') : (t('share') || 'Share')}
                        </button>
                    </div>

                    {/* Shop Info Card */}
                    {service.shop && (
                        <div className="bg-muted/50 rounded-2xl p-6 mt-auto border border-border">
                            <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-4">Service Provider</h3>
                            <div className="flex items-start gap-4">
                                <Link href={`/store/${service.shop.id}`} className="flex-shrink-0">
                                    <div className="w-16 h-16 rounded-full bg-background border border-border shadow-sm overflow-hidden flex items-center justify-center">
                                        {service.shop.logo_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={service.shop.logo_url} alt={shopName} className="w-full h-full object-cover" />
                                        ) : (
                                            <Store className="w-8 h-8 text-muted-foreground" />
                                        )}
                                    </div>
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/store/${service.shop.id}`} className="block group">
                                        <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                                            {shopName}
                                            {service.shop.is_verified && <Check className="w-4 h-4 text-blue-500" />}
                                        </h4>
                                    </Link>
                                    {(service.shop.city || service.shop.address_line_1) && (
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span className="truncate">
                                                {[service.shop.city, service.shop.address_line_1].filter(Boolean).join(', ')}
                                            </span>
                                        </div>
                                    )}
                                    <Link
                                        href={`/store/${service.shop.id}`}
                                        className="inline-block mt-3 text-sm font-medium text-primary hover:underline"
                                    >
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailsClient;
