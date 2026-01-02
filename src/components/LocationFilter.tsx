'use client';

import React, { useState } from 'react';
import { useLocationFilter } from '@/context/LocationFilterContext';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, ChevronDown, X, Package, Wrench, Store } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function LocationFilter() {
    const { t } = useLanguage();
    const {
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
    } = useLocationFilter();

    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const currentTab = (searchParams.get('tab') as 'products' | 'services' | 'shops') || 'products';
    const [isExpanded, setIsExpanded] = useState(false);
    const hasFilters = selectedState || selectedDistrict || selectedTown;
    const isHomePage = pathname === '/';

    const handleTabChange = (tab: 'products' | 'services' | 'shops') => {
        const params = new URLSearchParams(searchParams.toString());

        // Clear category filters when switching tabs
        params.delete('category');
        params.delete('subcategory');

        if (tab === 'products') {
            params.delete('tab');
        } else {
            params.set('tab', tab);
        }
        router.push(`/?${params.toString()}`, { scroll: false });
    };

    const getFilterDisplayText = () => {
        if (selectedTown) return selectedTown;
        if (selectedDistrict) return selectedDistrict;
        if (selectedState) return selectedState;
        return t('allIndia');
    };

    return (
        <div className="location-filter">
            {/* Desktop: Horizontal bar with tabs + location filter */}
            <div className="desktop-bar">
                <div className="bar-container">
                    {/* Products/Services/Shops Tabs */}
                    {isHomePage && (
                        <div className="tab-group">
                            <button
                                className={`tab-btn ${currentTab === 'products' ? 'active' : ''}`}
                                onClick={() => handleTabChange('products')}
                            >
                                <Package className="w-4 h-4" />
                                <span>{t('products')}</span>
                            </button>
                            <button
                                className={`tab-btn ${currentTab === 'services' ? 'active' : ''}`}
                                onClick={() => handleTabChange('services')}
                            >
                                <Wrench className="w-4 h-4" />
                                <span>{t('services')}</span>
                            </button>
                            <button
                                className={`tab-btn ${currentTab === 'shops' ? 'active' : ''}`}
                                onClick={() => handleTabChange('shops')}
                            >
                                <Store className="w-4 h-4" />
                                <span>{t('shops')}</span>
                            </button>
                        </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Location Filter */}
                    <div className="filter-group">
                        <div className="filter-row">
                            <select
                                value={selectedState || ''}
                                onChange={(e) => setSelectedState(e.target.value || null)}
                                className="filter-select"
                            >
                                <option value="">{t('allStates')}</option>
                                {states.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select
                                value={selectedDistrict || ''}
                                onChange={(e) => setSelectedDistrict(e.target.value || null)}
                                className="filter-select"
                                disabled={!selectedState}
                            >
                                <option value="">{t('allDistricts')}</option>
                                {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select
                                value={selectedTown || ''}
                                onChange={(e) => setSelectedTown(e.target.value || null)}
                                className="filter-select"
                                disabled={!selectedDistrict || isLoadingTowns}
                            >
                                <option value="">{isLoadingTowns ? 'Loading...' : t('allTowns')}</option>
                                {towns.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                            {hasFilters && (
                                <button onClick={clearAll} className="clear-btn">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile: Compact row with tabs + location chip */}
            <div className="mobile-bar">
                {/* Tabs - only on home page */}
                {isHomePage && (
                    <div className="mobile-tabs">
                        <button
                            className={`m-tab ${currentTab === 'products' ? 'active' : ''}`}
                            onClick={() => handleTabChange('products')}
                        >
                            <Package className="w-3.5 h-3.5" />
                            {t('products')}
                        </button>
                        <button
                            className={`m-tab ${currentTab === 'services' ? 'active' : ''}`}
                            onClick={() => handleTabChange('services')}
                        >
                            <Wrench className="w-3.5 h-3.5" />
                            {t('services')}
                        </button>
                        <button
                            className={`m-tab ${currentTab === 'shops' ? 'active' : ''}`}
                            onClick={() => handleTabChange('shops')}
                        >
                            <Store className="w-3.5 h-3.5" />
                            {t('shops')}
                        </button>
                    </div>
                )}

                {/* Location chip */}
                <div className="mobile-loc-row">
                    <button
                        className={`loc-chip ${hasFilters ? 'has-filter' : ''}`}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <MapPin className="w-3 h-3" />
                        <span>{getFilterDisplayText()}</span>
                        <ChevronDown className={`w-3 h-3 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {hasFilters && (
                        <button onClick={clearAll} className="chip-clear">
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile expanded panel */}
            {isExpanded && (
                <>
                    <div className="mobile-panel">
                        <div className="panel-body">
                            <div className="field">
                                <label>State</label>
                                <select value={selectedState || ''} onChange={(e) => setSelectedState(e.target.value || null)}>
                                    <option value="">All States</option>
                                    {states.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="field">
                                <label>District</label>
                                <select value={selectedDistrict || ''} onChange={(e) => setSelectedDistrict(e.target.value || null)} disabled={!selectedState}>
                                    <option value="">All Districts</option>
                                    {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="field">
                                <label>Town</label>
                                <select value={selectedTown || ''} onChange={(e) => setSelectedTown(e.target.value || null)} disabled={!selectedDistrict || isLoadingTowns}>
                                    <option value="">{isLoadingTowns ? 'Loading...' : 'All Towns'}</option>
                                    {towns.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="panel-footer">
                            {hasFilters && <button onClick={clearAll} className="btn-clear">Clear</button>}
                            <button onClick={() => setIsExpanded(false)} className="btn-done">Done</button>
                        </div>
                    </div>
                    <div className="backdrop" onClick={() => setIsExpanded(false)} />
                </>
            )}

            <style jsx>{`
                .location-filter { position: relative; }

                /* Desktop Bar */
                .desktop-bar {
                    display: none;
                    background: hsl(var(--secondary) / 0.3);
                    border-bottom: 1px solid hsl(var(--border) / 0.3);
                }

                @media (min-width: 1024px) {
                    .desktop-bar {
                        display: block;
                    }
                    .mobile-bar {
                        display: none;
                    }
                }

                .bar-container {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    max-width: 1536px;
                    margin: 0 auto;
                    padding: 8px 16px;
                }

                .tab-group {
                    display: flex;
                    gap: 4px;
                    padding: 3px;
                    background: hsl(var(--muted));
                    border-radius: 8px;
                }

                .tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    font-size: 13px;
                    font-weight: 500;
                    border: none;
                    background: transparent;
                    color: hsl(var(--muted-foreground));
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .tab-btn:hover {
                    color: hsl(var(--foreground));
                }

                .tab-btn.active {
                    background: hsl(var(--background));
                    color: hsl(var(--foreground));
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .filter-group {
                    display: flex;
                    align-items: center;
                }

                .filter-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .filter-select {
                    padding: 6px 10px;
                    border: 1px solid hsl(var(--border));
                    border-radius: 6px;
                    background: hsl(var(--background));
                    color: hsl(var(--foreground));
                    font-size: 12px;
                    min-width: 120px;
                }

                .filter-select:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .clear-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border: 1px solid hsl(var(--border));
                    border-radius: 6px;
                    background: hsl(var(--background));
                    color: hsl(var(--muted-foreground));
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .clear-btn:hover {
                    background: hsl(var(--destructive) / 0.1);
                    color: hsl(var(--destructive));
                    border-color: hsl(var(--destructive) / 0.3);
                }

                /* Mobile Bar */
                .mobile-bar {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    gap: 4px;
                    padding: 2px 8px;
                    background: hsl(var(--secondary) / 0.3);
                    border-bottom: 1px solid hsl(var(--border) / 0.3);
                    overflow-x: auto;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                
                .mobile-bar::-webkit-scrollbar {
                    display: none;
                }

                .mobile-tabs {
                    display: flex;
                    gap: 3px;
                    padding: 2px;
                    background: hsl(var(--muted));
                    border-radius: 6px;
                    flex-shrink: 0;
                }

                .m-tab {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 2px;
                    padding: 0px 8px;
                    font-size: 11px;
                    font-weight: 500;
                    border: none;
                    background: transparent;
                    color: hsl(var(--muted-foreground));
                    border-radius: 5px;
                    cursor: pointer;
                }

                .m-tab.active {
                    background: hsl(var(--background));
                    color: hsl(var(--foreground));
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }

                .mobile-loc-row {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    flex-shrink: 0;
                    margin-left: auto;
                }

                .loc-chip {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    padding: 0px 8px;
                    border: 1px solid hsl(var(--border));
                    border-radius: 12px;
                    background: hsl(var(--background));
                    color: hsl(var(--foreground));
                    font-size: 9px;
                    font-weight: 500;
                    line-height: 1;
                    cursor: pointer;
                }

                .loc-chip.has-filter {
                    background: hsl(var(--primary) / 0.1);
                    border-color: hsl(var(--primary) / 0.3);
                    color: hsl(var(--primary));
                }

                .chip-clear {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 16px;
                    height: 16px;
                    min-width: 16px;
                    min-height: 16px;
                    flex-shrink: 0;
                    border: 1px solid hsl(var(--border));
                    border-radius: 50%;
                    background: hsl(var(--background));
                    color: hsl(var(--muted-foreground));
                    cursor: pointer;
                }

                .mobile-panel {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    z-index: 100;
                    background: hsl(var(--background));
                    border: 1px solid hsl(var(--border));
                    border-radius: 0 0 12px 12px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                }

                .panel-body {
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .field label {
                    display: block;
                    font-size: 10px;
                    font-weight: 500;
                    color: hsl(var(--muted-foreground));
                    margin-bottom: 3px;
                }

                .field select {
                    width: 100%;
                    padding: 7px;
                    border: 1px solid hsl(var(--border));
                    border-radius: 5px;
                    background: hsl(var(--background));
                    color: hsl(var(--foreground));
                    font-size: 12px;
                }

                .panel-footer {
                    display: flex;
                    gap: 6px;
                    padding: 8px 10px;
                    border-top: 1px solid hsl(var(--border) / 0.5);
                }

                .btn-clear {
                    flex: 1;
                    padding: 7px;
                    border: 1px solid hsl(var(--border));
                    border-radius: 5px;
                    background: transparent;
                    color: hsl(var(--foreground));
                    font-size: 11px;
                    cursor: pointer;
                }

                .btn-done {
                    flex: 2;
                    padding: 7px;
                    border: none;
                    border-radius: 5px;
                    background: hsl(var(--primary));
                    color: hsl(var(--primary-foreground));
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 99;
                    background: rgba(0,0,0,0.2);
                }

                /* Desktop overrides - MUST be at the end */
                @media (min-width: 640px) {
                    .mobile-bar {
                        padding: 6px 14px;
                        gap: 6px;
                    }
                    .m-tab {
                        padding: 5px 6px;
                        font-size: 11px;
                    }
                    .loc-chip {
                        padding: 4px 10px;
                        font-size: 11px;
                    }
                }

                @media (min-width: 1024px) {
                    .mobile-bar,
                    .mobile-tabs,
                    .mobile-loc-row,
                    .mobile-panel,
                    .backdrop {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
