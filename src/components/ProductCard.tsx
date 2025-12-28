import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    mrp: number;
    imageUrl: string | null;
    shopId: string;
    shopName: string;
    shopLogo?: string;
    shopPhone?: string;
    category?: string;
    stock?: number;
    specifications?: any;
    props?: any; // Fallback
}

const ProductCard = (props: ProductCardProps) => {
    const { id, name, price, mrp, imageUrl, shopId, shopName, shopPhone, shopLogo, category } = props;
    const { t } = useLanguage();
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        addToCart({
            productId: id,
            quantity: 1,
            shopId: shopId,
            shopName: shopName,
            shopPhone: shopPhone,
            shopLogo: shopLogo,
            productName: name,
            price: price,
            imageUrl: imageUrl || undefined,
        });
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    // Logic for visibility and badges
    // 1. Hide Flag Check
    const specifications = (props as any).specifications || {}; // Assuming specifications might be passed down or available in future.
    // NOTE: ProductCardProps needs 'specifications' or 'stock' to work fully.
    // Currently props only have id, name, price, mrp... checking if I need to update interface.

    // Let's assume 'stock' and 'specifications' are added to props.
    // Updating code to use them.
    const { stock, specifications: specs } = props as any;

    const isOutOfStock = stock !== undefined && stock <= 0;
    const hideWhenOutOfStock = specs?.hide_out_of_stock === true;
    const isLowStock = stock !== undefined && stock > 0 && stock <= (specs?.min_stock_alert || 5); // Default 5 if not set

    if (isOutOfStock && hideWhenOutOfStock) {
        return null; // Hide product completely
    }

    return (
        <Link href={`/product/${id}`} className="group block h-full">
            <div className={`overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/50 h-full flex flex-col relative ${isOutOfStock ? 'opacity-75' : ''}`}>
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={imageUrl}
                            alt={name}
                            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'grayscale' : ''}`}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary/50 to-muted flex items-center justify-center text-muted-foreground/50">
                            <svg className="w-10 h-10 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {isOutOfStock && (
                            <div className="rounded bg-gray-600 px-2 py-1 text-xs font-bold text-white">
                                {(t as any)('outOfStock') || 'Out of Stock'}
                            </div>
                        )}
                        {!isOutOfStock && isLowStock && (
                            <div className="rounded bg-orange-500 px-2 py-1 text-xs font-bold text-white">
                                {(t as any)('limitedStock') || 'Limited Stock'}
                            </div>
                        )}
                        {!isOutOfStock && discount > 0 && (
                            <div className="rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
                                {discount}{t('off')}
                            </div>
                        )}
                    </div>

                    {/* Add to Cart Button - Disable if OOS */}
                    {!isOutOfStock && (
                        <button
                            onClick={handleAddToCart}
                            className="absolute bottom-2 right-2 p-2 rounded-full bg-background/90 text-foreground shadow-sm hover:bg-primary hover:text-primary-foreground transition-all 
                            opacity-100 translate-y-0
                            md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 z-20"
                            title={t('addToCart')}
                        >
                            {isAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                        </button>
                    )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {category || 'General'}
                        </span>
                    </div>
                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">{name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{shopName}</p>

                    <div className="mt-auto flex items-baseline gap-2">
                        <span className="font-bold text-lg">₹{price}</span>
                        {mrp > price && (
                            <span className="text-xs text-muted-foreground line-through">₹{mrp}</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
