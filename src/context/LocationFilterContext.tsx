'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Kerala districts list
const KERALA_DISTRICTS = [
    'Thiruvananthapuram',
    'Kollam',
    'Pathanamthitta',
    'Alappuzha',
    'Kottayam',
    'Idukki',
    'Ernakulam',
    'Thrissur',
    'Palakkad',
    'Malappuram',
    'Kozhikode',
    'Wayanad',
    'Kannur',
    'Kasaragod',
];

interface LocationFilterContextType {
    // Selected values
    selectedState: string | null;
    selectedDistrict: string | null;
    selectedTown: string | null;

    // Available options
    states: string[];
    districts: string[];
    towns: string[];
    isLoadingTowns: boolean;

    // Actions
    setSelectedState: (state: string | null) => void;
    setSelectedDistrict: (district: string | null) => void;
    setSelectedTown: (town: string | null) => void;
    clearAll: () => void;

    // Helper for building filter params
    getFilterParams: () => { state?: string; district?: string; town?: string };
}

const LocationFilterContext = createContext<LocationFilterContextType | undefined>(undefined);

export const LocationFilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedState, setSelectedStateInternal] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrictInternal] = useState<string | null>(null);
    const [selectedTown, setSelectedTownInternal] = useState<string | null>(null);

    const [towns, setTowns] = useState<string[]>([]);
    const [isLoadingTowns, setIsLoadingTowns] = useState(false);

    // Available states (starting with Kerala only)
    const states = ['Kerala'];

    // Available districts based on selected state
    const districts = selectedState === 'Kerala' ? KERALA_DISTRICTS : [];

    // Load from localStorage on mount
    useEffect(() => {
        const storedState = localStorage.getItem('vallaroo_filter_state');
        const storedDistrict = localStorage.getItem('vallaroo_filter_district');
        const storedTown = localStorage.getItem('vallaroo_filter_town');

        if (storedState) setSelectedStateInternal(storedState);
        if (storedDistrict) setSelectedDistrictInternal(storedDistrict);
        if (storedTown) setSelectedTownInternal(storedTown);
    }, []);

    // Persist to localStorage
    useEffect(() => {
        if (selectedState) {
            localStorage.setItem('vallaroo_filter_state', selectedState);
        } else {
            localStorage.removeItem('vallaroo_filter_state');
        }
    }, [selectedState]);

    useEffect(() => {
        if (selectedDistrict) {
            localStorage.setItem('vallaroo_filter_district', selectedDistrict);
        } else {
            localStorage.removeItem('vallaroo_filter_district');
        }
    }, [selectedDistrict]);

    useEffect(() => {
        if (selectedTown) {
            localStorage.setItem('vallaroo_filter_town', selectedTown);
        } else {
            localStorage.removeItem('vallaroo_filter_town');
        }
    }, [selectedTown]);

    // Fetch towns when district changes
    useEffect(() => {
        const fetchTowns = async () => {
            if (!selectedDistrict) {
                setTowns([]);
                return;
            }

            setIsLoadingTowns(true);
            try {
                const { data, error } = await supabase
                    .from('shops')
                    .select('town')
                    .eq('district', selectedDistrict)
                    .not('town', 'is', null);

                if (error) {
                    console.error('Error fetching towns:', error);
                    setTowns([]);
                } else {
                    // Get unique towns
                    const uniqueTowns = [...new Set(data.map(d => d.town).filter(Boolean))] as string[];
                    setTowns(uniqueTowns.sort());
                }
            } catch (err) {
                console.error('Error fetching towns:', err);
                setTowns([]);
            } finally {
                setIsLoadingTowns(false);
            }
        };

        fetchTowns();
    }, [selectedDistrict]);

    const setSelectedState = useCallback((state: string | null) => {
        setSelectedStateInternal(state);
        // Clear district and town when state changes
        setSelectedDistrictInternal(null);
        setSelectedTownInternal(null);
    }, []);

    const setSelectedDistrict = useCallback((district: string | null) => {
        setSelectedDistrictInternal(district);
        // Clear town when district changes
        setSelectedTownInternal(null);
    }, []);

    const setSelectedTown = useCallback((town: string | null) => {
        setSelectedTownInternal(town);
    }, []);

    const clearAll = useCallback(() => {
        setSelectedStateInternal(null);
        setSelectedDistrictInternal(null);
        setSelectedTownInternal(null);
    }, []);

    const getFilterParams = useCallback(() => {
        const params: { state?: string; district?: string; town?: string } = {};
        if (selectedTown) params.town = selectedTown;
        else if (selectedDistrict) params.district = selectedDistrict;
        else if (selectedState) params.state = selectedState;
        return params;
    }, [selectedState, selectedDistrict, selectedTown]);

    return (
        <LocationFilterContext.Provider
            value={{
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
                clearAll,
                getFilterParams,
            }}
        >
            {children}
        </LocationFilterContext.Provider>
    );
};

export const useLocationFilter = () => {
    const context = useContext(LocationFilterContext);
    if (context === undefined) {
        throw new Error('useLocationFilter must be used within a LocationFilterProvider');
    }
    return context;
};
