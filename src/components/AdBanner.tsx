'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';
import { useLocation } from '@/context/LocationContext';

interface Ad {
    id: string;
    title: string;
    image_url: string;
    type: 'external' | 'internal_shop' | 'internal_product';
    target_value: string;
}

interface AdBannerProps {
    placement: 'home_top_carousel' | 'home_feed_insert' | 'search_sidebar';
    className?: string; // Allow custom styling/height
}

export default function AdBanner({ placement, className }: AdBannerProps) {
    const [ads, setAds] = useState<Ad[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const { latitude, longitude } = useLocation();

    useEffect(() => {
        async function fetchAds() {
            // Fetch active ads for this placement based on location
            const { data } = await supabase.rpc('get_targeted_ads', {
                p_placement: placement,
                p_lat: latitude || 0,
                p_lng: longitude || 0,
            });

            if (data) setAds(data);
        }
        fetchAds();
    }, [placement, latitude, longitude]);

    useEffect(() => {
        if (ads.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % ads.length);
        }, 5000); // Rotate every 5 seconds
        return () => clearInterval(interval);
    }, [ads.length]);

    if (ads.length === 0) return null;

    const activeAd = ads[currentIndex];

    const href =
        activeAd.type === 'external' ? activeAd.target_value :
            activeAd.type === 'internal_shop' ? `/shop/${activeAd.target_value}` :
                `/product/${activeAd.target_value}`;

    const isExternal = activeAd.type === 'external';

    return (
        <div className={`relative w-full overflow-hidden rounded-xl shadow-sm ${className || 'h-48'}`}>
            <Link href={href} target={isExternal ? '_blank' : undefined} className="block w-full h-full relative">
                <Image
                    src={activeAd.image_url}
                    alt={activeAd.title}
                    fill
                    className="object-cover transition-opacity duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 md:p-6 flex flex-col justify-end">
                    <h3 className="text-white text-lg md:text-xl font-bold line-clamp-2 drop-shadow-md mb-1">
                        {activeAd.title}
                    </h3>
                    <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
                        Sponsored
                    </p>
                </div>
            </Link>

            {/* Indicators if multiple ads */}
            {ads.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {ads.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/50'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
