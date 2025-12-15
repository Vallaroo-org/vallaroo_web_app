'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getPlaceName } from '../lib/locationService';

interface LocationContextType {
    latitude: number | null;
    longitude: number | null;
    placeName: string | null;
    error: string | null;
    isLoading: boolean;
    requestLocation: () => Promise<void>;
    setManualLocation: (place: string) => void;
    permissionStatus: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [placeName, setPlaceName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

    // Check storage on mount
    useEffect(() => {
        // We could persist location in sessionStorage if needed
        // const storedLat = sessionStorage.getItem('vallaroo_lat');
        // const storedLng = sessionStorage.getItem('vallaroo_lng');
        // if (storedLat && storedLng) {
        //   setLatitude(parseFloat(storedLat));
        //   setLongitude(parseFloat(storedLng));
        // }
    }, []);

    const requestLocation = async () => {
        setIsLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
                setError(null);
                setPermissionStatus('granted');

                // Fetch place name
                const name = await getPlaceName(position.coords.latitude, position.coords.longitude);
                setPlaceName(name);

                setIsLoading(false);

                // Save to session storage
                // sessionStorage.setItem('vallaroo_lat', position.coords.latitude.toString());
                // sessionStorage.setItem('vallaroo_lng', position.coords.longitude.toString());
            },
            (err) => {
                let errorMessage = 'Unable to retrieve your location';
                if (err.code === err.PERMISSION_DENIED) {
                    errorMessage = 'Location permission denied';
                    setPermissionStatus('denied');
                } else if (err.code === err.POSITION_UNAVAILABLE) {
                    errorMessage = 'Location unavailable';
                } else if (err.code === err.TIMEOUT) {
                    errorMessage = 'Location request timed out';
                }

                setError(errorMessage);
                setIsLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const setManualLocation = (place: string) => {
        setPlaceName(place);
        // Clear coordinates when manually setting location
        setLatitude(null);
        setLongitude(null);
        setError(null);
    };

    return (
        <LocationContext.Provider
            value={{
                latitude,
                longitude,
                placeName,
                error,
                isLoading,
                requestLocation,
                setManualLocation,
                permissionStatus
            }}
        >
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
