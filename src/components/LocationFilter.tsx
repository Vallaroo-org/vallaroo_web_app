'use client';

import React, { useState } from 'react';
import { useLocationFilter } from '@/context/LocationFilterContext';

export default function LocationFilter() {
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

    const [isExpanded, setIsExpanded] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const hasFilters = selectedState || selectedDistrict || selectedTown;

    // Build display text for collapsed state
    const getFilterDisplayText = () => {
        if (selectedTown) return selectedTown;
        if (selectedDistrict) return selectedDistrict;
        if (selectedState) return selectedState;
        return 'All India';
    };

    return (
        <div className="location-filter">
            {/* Mobile: Compact chip/button that expands */}
            <div className="mobile-filter">
                <button
                    className="filter-toggle"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="filter-text">{getFilterDisplayText()}</span>
                    <svg className={`chevron ${isExpanded ? 'open' : ''}`} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </button>

                {hasFilters && (
                    <button onClick={clearAll} className="clear-icon" title="Clear filters">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}
            </div>

            {/* Desktop: Always show dropdowns inline */}
            <div className="desktop-filter">
                {/* Info Icon with Tooltip */}
                <div className="info-container">
                    <button
                        className="info-button"
                        onClick={() => setShowTooltip(!showTooltip)}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        aria-label="Location filter info"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 16v-4"></path>
                            <path d="M12 8h.01"></path>
                        </svg>
                    </button>
                    {showTooltip && (
                        <div className="tooltip">
                            <strong>Location Filter</strong>
                            <ul>
                                <li>Town → Results from that town only</li>
                                <li>District only → Entire district</li>
                                <li>State only → Entire state</li>
                                <li>Clear → All India</li>
                            </ul>
                        </div>
                    )}
                </div>

                <select
                    value={selectedState || ''}
                    onChange={(e) => setSelectedState(e.target.value || null)}
                    className="filter-select"
                >
                    <option value="">All States</option>
                    {states.map((state) => (
                        <option key={state} value={state}>{state}</option>
                    ))}
                </select>

                <select
                    value={selectedDistrict || ''}
                    onChange={(e) => setSelectedDistrict(e.target.value || null)}
                    className="filter-select"
                    disabled={!selectedState}
                >
                    <option value="">All Districts</option>
                    {districts.map((district) => (
                        <option key={district} value={district}>{district}</option>
                    ))}
                </select>

                <select
                    value={selectedTown || ''}
                    onChange={(e) => setSelectedTown(e.target.value || null)}
                    className="filter-select"
                    disabled={!selectedDistrict || isLoadingTowns}
                >
                    <option value="">
                        {isLoadingTowns ? 'Loading...' : 'All Towns'}
                    </option>
                    {towns.map((town) => (
                        <option key={town} value={town}>{town}</option>
                    ))}
                </select>

                {hasFilters && (
                    <button onClick={clearAll} className="clear-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Clear
                    </button>
                )}
            </div>

            {/* Mobile: Expanded dropdown panel */}
            {isExpanded && (
                <div className="mobile-dropdown-panel">
                    <div className="panel-header">
                        <span>Filter by Location</span>
                        <button onClick={() => setIsExpanded(false)} className="close-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <div className="panel-content">
                        <div className="select-group">
                            <label>State</label>
                            <select
                                value={selectedState || ''}
                                onChange={(e) => setSelectedState(e.target.value || null)}
                            >
                                <option value="">All States</option>
                                {states.map((state) => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        <div className="select-group">
                            <label>District</label>
                            <select
                                value={selectedDistrict || ''}
                                onChange={(e) => setSelectedDistrict(e.target.value || null)}
                                disabled={!selectedState}
                            >
                                <option value="">All Districts</option>
                                {districts.map((district) => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>

                        <div className="select-group">
                            <label>Town</label>
                            <select
                                value={selectedTown || ''}
                                onChange={(e) => setSelectedTown(e.target.value || null)}
                                disabled={!selectedDistrict || isLoadingTowns}
                            >
                                <option value="">
                                    {isLoadingTowns ? 'Loading...' : 'All Towns'}
                                </option>
                                {towns.map((town) => (
                                    <option key={town} value={town}>{town}</option>
                                ))}
                            </select>
                        </div>

                        <p className="hint">
                            Select location to filter products, services and shops.
                        </p>
                    </div>

                    <div className="panel-footer">
                        {hasFilters && (
                            <button onClick={clearAll} className="clear-all-btn">
                                Clear All
                            </button>
                        )}
                        <button onClick={() => setIsExpanded(false)} className="apply-btn">
                            Apply
                        </button>
                    </div>
                </div>
            )}

            {/* Backdrop for mobile panel */}
            {isExpanded && (
                <div className="backdrop" onClick={() => setIsExpanded(false)} />
            )}

            <style jsx>{`
                .location-filter {
                    position: relative;
                }

                /* Mobile filter toggle */
                .mobile-filter {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 12px;
                    background: var(--bg-secondary, hsl(var(--secondary) / 0.5));
                    border-bottom: 1px solid hsl(var(--border) / 0.4);
                }

                .filter-toggle {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    border: 1px solid hsl(var(--border));
                    border-radius: 20px;
                    background: hsl(var(--background));
                    color: hsl(var(--foreground));
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .filter-toggle:hover {
                    border-color: hsl(var(--primary));
                }

                .filter-text {
                    max-width: 150px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .chevron {
                    transition: transform 0.2s;
                }

                .chevron.open {
                    transform: rotate(180deg);
                }

                .clear-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border: none;
                    border-radius: 50%;
                    background: hsl(var(--destructive) / 0.1);
                    color: hsl(var(--destructive));
                    cursor: pointer;
                }

                /* Desktop filter row */
                .desktop-filter {
                    display: none;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: hsl(var(--secondary) / 0.3);
                    border-bottom: 1px solid hsl(var(--border) / 0.4);
                }

                .info-container {
                    position: relative;
                }

                .info-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border: none;
                    background: transparent;
                    color: hsl(var(--muted-foreground));
                    cursor: pointer;
                    border-radius: 50%;
                }

                .info-button:hover {
                    background: hsl(var(--accent));
                }

                .tooltip {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    z-index: 1000;
                    min-width: 240px;
                    padding: 10px;
                    background: hsl(var(--popover));
                    color: hsl(var(--popover-foreground));
                    border: 1px solid hsl(var(--border));
                    border-radius: 8px;
                    font-size: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .tooltip strong {
                    display: block;
                    margin-bottom: 6px;
                }

                .tooltip ul {
                    margin: 0;
                    padding-left: 14px;
                }

                .tooltip li {
                    margin: 2px 0;
                }

                .filter-select {
                    padding: 6px 10px;
                    border: 1px solid hsl(var(--border));
                    border-radius: 6px;
                    background: hsl(var(--background));
                    color: hsl(var(--foreground));
                    font-size: 13px;
                    min-width: 110px;
                    cursor: pointer;
                }

                .filter-select:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .filter-select:focus {
                    outline: none;
                    border-color: hsl(var(--primary));
                }

                .clear-button {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 6px 10px;
                    border: none;
                    background: hsl(var(--destructive) / 0.1);
                    color: hsl(var(--destructive));
                    border-radius: 6px;
                    font-size: 13px;
                    cursor: pointer;
                }

                .clear-button:hover {
                    background: hsl(var(--destructive) / 0.2);
                }

                /* Mobile dropdown panel */
                .mobile-dropdown-panel {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    z-index: 100;
                    background: hsl(var(--background));
                    border: 1px solid hsl(var(--border));
                    border-radius: 0 0 12px 12px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                    animation: slideDown 0.2s ease;
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    border-bottom: 1px solid hsl(var(--border) / 0.5);
                    font-weight: 600;
                    font-size: 14px;
                }

                .close-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border: none;
                    background: transparent;
                    color: hsl(var(--muted-foreground));
                    cursor: pointer;
                    border-radius: 50%;
                }

                .panel-content {
                    padding: 12px 16px;
                }

                .select-group {
                    margin-bottom: 12px;
                }

                .select-group label {
                    display: block;
                    font-size: 12px;
                    font-weight: 500;
                    color: hsl(var(--muted-foreground));
                    margin-bottom: 4px;
                }

                .select-group select {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid hsl(var(--border));
                    border-radius: 8px;
                    background: hsl(var(--background));
                    color: hsl(var(--foreground));
                    font-size: 14px;
                }

                .select-group select:disabled {
                    opacity: 0.5;
                }

                .hint {
                    font-size: 11px;
                    color: hsl(var(--muted-foreground));
                    margin: 8px 0 0;
                }

                .panel-footer {
                    display: flex;
                    gap: 8px;
                    padding: 12px 16px;
                    border-top: 1px solid hsl(var(--border) / 0.5);
                }

                .clear-all-btn {
                    flex: 1;
                    padding: 10px;
                    border: 1px solid hsl(var(--border));
                    border-radius: 8px;
                    background: transparent;
                    color: hsl(var(--foreground));
                    font-size: 14px;
                    cursor: pointer;
                }

                .apply-btn {
                    flex: 2;
                    padding: 10px;
                    border: none;
                    border-radius: 8px;
                    background: hsl(var(--primary));
                    color: hsl(var(--primary-foreground));
                    font-size: 14px;
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
                    background: rgba(0,0,0,0.3);
                }

                /* Desktop: show inline dropdowns, hide mobile toggle */
                @media (min-width: 768px) {
                    .mobile-filter {
                        display: none;
                    }

                    .desktop-filter {
                        display: flex;
                    }

                    .mobile-dropdown-panel,
                    .backdrop {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}
