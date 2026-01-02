'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getProductCategories, getProductSubCategories, type ProductCategory, type ProductSubCategory } from '../app/actions/get-categories';
import { getServiceCategories, type ServiceCategory } from '../app/actions/get-service-categories';
import { getShopCategories, type ShopCategory } from '../app/actions/get-shop-categories';
import { useLanguage } from '../context/LanguageContext';
import {
    ChevronLeft, ChevronRight
} from 'lucide-react';



// Generic category type
type Category = {
    id: string;
    name: string;
    name_ml?: string | null;
};

interface StickyCategoryBarProps {
    onCategoryClick?: (category: string) => void;
}

const StickyCategoryBar = ({ onCategoryClick }: StickyCategoryBarProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Record<string, ProductSubCategory[]>>({});
    const [loading, setLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const [loadingSubcats, setLoadingSubcats] = useState<string | null>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [subCanScrollLeft, setSubCanScrollLeft] = useState(false);
    const [subCanScrollRight, setSubCanScrollRight] = useState(false);
    const { locale } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const subScrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const scrollSub = (direction: 'left' | 'right') => {
        if (subScrollContainerRef.current) {
            const { current } = subScrollContainerRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Get active tab from URL
    const activeTab = (searchParams.get('tab') as 'products' | 'services' | 'shops') || 'products';
    const isHomePage = pathname === '/';

    // Detect scroll position
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check initial state

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch categories based on active tab
    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                let data: Category[] = [];

                if (activeTab === 'products') {
                    data = await getProductCategories();
                } else if (activeTab === 'services') {
                    data = await getServiceCategories();
                } else if (activeTab === 'shops') {
                    data = await getShopCategories();
                }

                setCategories(data); // Show all categories
                setSubcategories({}); // Clear subcategories when tab changes
                setHoveredCategory(null);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isHomePage) {
            fetchCategories();
        }
    }, [activeTab, isHomePage]);

    // Check scroll availability
    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding tolerance
        }
    };

    const checkSubScroll = () => {
        if (subScrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = subScrollContainerRef.current;
            setSubCanScrollLeft(scrollLeft > 0);
            setSubCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };
    const activeCategoryName = searchParams.get('category');
    const activeSubcategoryName = searchParams.get('subcategory');


    useEffect(() => {
        checkScroll();
        checkSubScroll();

        window.addEventListener('resize', checkScroll);
        window.addEventListener('resize', checkSubScroll);

        const mainContainer = scrollContainerRef.current;
        const subContainer = subScrollContainerRef.current;

        if (mainContainer) {
            mainContainer.addEventListener('scroll', checkScroll);
        }
        if (subContainer) {
            subContainer.addEventListener('scroll', checkSubScroll);
        }

        return () => {
            window.removeEventListener('resize', checkScroll);
            window.removeEventListener('resize', checkSubScroll);
            if (mainContainer) mainContainer.removeEventListener('scroll', checkScroll);
            if (subContainer) subContainer.removeEventListener('scroll', checkSubScroll);
        };
    }, [categories, subcategories, activeCategoryName]);



    // Fetch subcategories for active category
    useEffect(() => {
        const fetchActiveSubcats = async () => {
            if (activeTab === 'products' && activeCategoryName && categories.length > 0) {
                // Determine if we need to fetch
                if (subcategories[activeCategoryName]) return;

                const category = categories.find(c => c.name === activeCategoryName);
                if (category) {
                    try {
                        const subs = await getProductSubCategories(category.id);
                        setSubcategories(prev => ({ ...prev, [activeCategoryName]: subs }));
                    } catch (error) {
                        console.error('Failed to fetch active subcategories:', error);
                    }
                }
            }
        };
        fetchActiveSubcats();
    }, [activeTab, activeCategoryName, categories, subcategories]);

    // Hover logic removed as per user request
    const handleHover = (cat: Category) => {
        // No-op
    };

    const handleMouseLeave = () => {
        // No-op
    };

    const handleClick = (categoryName: string, subCategory?: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('category', categoryName);
        if (subCategory) {
            params.set('subcategory', subCategory);
        } else {
            params.delete('subcategory');
        }
        router.push(`/?${params.toString()}`);
        setHoveredCategory(null);
    };

    // Don't show on non-home pages
    if (!isHomePage) {
        return null;
    }

    if (loading) {
        return (
            <div className="sticky-category-bar">
                <div className="bar-content">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="cat-item-skeleton" />
                    ))}
                </div>
                <style jsx>{skeletonStyles}</style>
            </div>
        );
    }

    if (categories.length === 0) {
        return null;
    }

    return (
        <div className={`sticky-category-bar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="main-row-wrapper">
                <button
                    className={`scroll-btn left lg:flex hidden items-center justify-center ${!canScrollLeft ? 'invisible pointer-events-none' : ''}`}
                    onClick={() => scroll('left')}
                    aria-label="Scroll left"
                    disabled={!canScrollLeft}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="bar-content" ref={scrollContainerRef}>
                    {categories.map((cat) => {
                        const displayName = locale === 'ml' && cat.name_ml ? cat.name_ml : cat.name;
                        const isHovered = hoveredCategory === cat.name;
                        const subs = subcategories[cat.name] || [];

                        return (
                            <div
                                key={cat.id}
                                className="cat-item-wrapper"
                            >
                                <button
                                    onClick={() => handleClick(cat.name)}
                                    className={`cat-item ${isHovered || activeCategoryName === cat.name ? 'hovered' : ''}`}
                                >

                                    <span className="cat-name">{displayName}</span>
                                </button>
                            </div>
                        );
                    })}
                </div>

                <button
                    className={`scroll-btn right lg:flex hidden items-center justify-center ${!canScrollRight ? 'invisible pointer-events-none' : ''}`}
                    onClick={() => scroll('right')}
                    aria-label="Scroll right"
                    disabled={!canScrollRight}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Persistent Subcategory Bar for Active Category */}
            {activeTab === 'products' && activeCategoryName && subcategories[activeCategoryName]?.length > 0 && (
                <div className="subcategory-bar">
                    <div className="main-row-wrapper">
                        <button
                            className={`scroll-btn left lg:flex hidden items-center justify-center ${!subCanScrollLeft ? 'invisible pointer-events-none' : ''}`}
                            onClick={() => scrollSub('left')}
                            aria-label="Scroll left"
                            disabled={!subCanScrollLeft}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="sub-bar-content" ref={subScrollContainerRef}>
                            <button
                                className={`sub-pill ${!activeSubcategoryName ? 'active' : ''}`}
                                onClick={() => handleClick(activeCategoryName)}
                            >
                                All
                            </button>
                            {subcategories[activeCategoryName].map((sub) => (
                                <button
                                    key={sub.id}
                                    className={`sub-pill ${activeSubcategoryName === sub.name ? 'active' : ''}`}
                                    onClick={() => handleClick(activeCategoryName, sub.name)}
                                >
                                    {locale === 'ml' && sub.name_ml ? sub.name_ml : sub.name}
                                </button>
                            ))}
                        </div>
                        <button
                            className={`scroll-btn right lg:flex hidden items-center justify-center ${!subCanScrollRight ? 'invisible pointer-events-none' : ''}`}
                            onClick={() => scrollSub('right')}
                            aria-label="Scroll right"
                            disabled={!subCanScrollRight}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .sticky-category-bar {
                    position: relative;
                    z-index: 40;
                    background: hsl(var(--background));
                    border-bottom: 1px solid hsl(var(--border) / 0.5);
                    display: flex;
                    flex-direction: column;
                }

                .main-row-wrapper {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 8px; /* Add some padding so arrows aren't flush with screen edge on large screens if desired, or remove */
                }

                .bar-content {
                    display: flex;
                    gap: 2px;
                    overflow-x: auto;
                    padding: 8px 4px; /* Reduced side padding since arrows are outside */
                    flex: 1; /* Take remaining space */
                    min-width: 0; /* Important for scroll to work in flex child */
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                
                /* Adjust scroll buttons to align with top row */
                .scroll-btn {
                    /* Removed absolute positioning */
                    flex-shrink: 0;
                    margin: 0 4px;
                    /* ... */
                }

                /* Subcategory Bar Styles */
                .subcategory-bar {
                    width: 100%;
                    border-top: 1px solid hsl(var(--border) / 0.3);
                    background: hsl(var(--muted) / 0.3);
                }

                .sub-bar-content {
                    display: flex;
                    gap: 8px;
                     overflow-x: auto;
                     padding: 2px 4px; /* Reduced padding consistent with main bar */
                     flex: 1;
                    min-width: 0;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                
                .sub-bar-content::-webkit-scrollbar {
                    display: none;
                }

                .sub-pill {
                    padding: 1px 6px;
                    border-radius: 20px;
                    font-size: 9px;
                    font-weight: 500;
                    line-height: 1;
                    background: transparent;
                    border: 1px solid hsl(var(--border));
                    color: hsl(var(--muted-foreground));
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                }

                .sub-pill:hover {
                    background: hsl(var(--background));
                    color: hsl(var(--foreground));
                    border-color: hsl(var(--foreground) / 0.3);
                }

                .sub-pill.active {
                    background: hsl(var(--primary));
                    color: hsl(var(--primary-foreground));
                    border-color: hsl(var(--primary));
                }


                .bar-content {
                    display: flex;
                    gap: 2px;
                    overflow-x: auto;
                    padding: 2px 16px;
                    width: 100%;
                    max-width: 1400px;
                    margin: 0 auto;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }

                .bar-content::-webkit-scrollbar {
                    display: none;
                }

                .cat-item-wrapper {
                    position: relative;
                    flex-shrink: 0;
                }

                .cat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 14px 6px;
                    border: none;
                    background: transparent;
                    color: hsl(var(--foreground));
                    font-size: 11px;
                    font-weight: 500;
                    line-height: 1;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                    border-radius: 8px;
                }

                .cat-item:hover,
                .cat-item.hovered {
                    background: hsl(var(--primary) / 0.1);
                    color: hsl(var(--primary));
                }



                .cat-name {
                    max-width: 80px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Scrolled state - compact, text only */
                .scrolled .cat-item {
                    flex-direction: row;
                    padding: 8px 16px;
                    font-size: 13px;
                }



                .scrolled .cat-name {
                    max-width: none;
                }

                /* Subcategory Dropdown CSS removed */

                .scroll-btn {
                    position: relative; /* relative instead of absolute */
                    top: auto;
                    transform: none;
                    z-index: 50;
                    background: hsl(var(--card));
                    border: 1px solid hsl(var(--border));
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    /* display: flex;  Removed to allow hidden/lg:flex to work properly */
                    /* align-items: center; Moved to Tailwind classes */
                    /* justify-content: center; Moved to Tailwind classes */
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    cursor: pointer;
                    color: hsl(var(--foreground));
                    transition: all 0.2s;
                    opacity: 0.8;
                }

                .scroll-btn:hover {
                    opacity: 1;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    transform: scale(1.05); /* Simplified transform */
                }

                .scroll-btn.left {
                    /* left: 16px; removed */
                }

                .scroll-btn.right {
                    /* right: 16px; removed */
                }

                @media (min-width: 640px) {
                    .sub-pill {
                        padding: 6px 14px;
                    }
                    .cat-item {
                        padding: 9px 14px;
                    }
                }

                @media (min-width: 1024px) {
                    .sub-pill {
                        padding: 8px 16px;
                    }
                    .cat-item {
                        padding: 10px 16px;
                    }
                }
            `}</style>
        </div>
    );
};

const skeletonStyles = `
    .sticky-category-bar {
        background: hsl(var(--background));
        border-bottom: 1px solid hsl(var(--border) / 0.5);
    }

    .bar-content {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding: 12px 16px;
        max-width: 1536px;
        margin: 0 auto;
    }

    .cat-item-skeleton {
        width: 70px;
        height: 70px;
        background: hsl(var(--muted));
        border-radius: 8px;
        flex-shrink: 0;
        animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;

export default StickyCategoryBar;
