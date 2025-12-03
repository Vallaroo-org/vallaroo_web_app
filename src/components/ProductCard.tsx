import Link from 'next/link';

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    mrp: number;
    imageUrl: string | null;
    shopName: string;
    category?: string;
}

const ProductCard = ({ id, name, price, mrp, imageUrl, shopName, category }: ProductCardProps) => {
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    return (
        <Link href={`/product/${id}`} className="group block h-full">
            <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/50 h-full flex flex-col">
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={imageUrl}
                            alt={name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary/50 to-muted flex items-center justify-center text-muted-foreground/50">
                            <svg className="w-10 h-10 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        </div>
                    )}
                    {discount > 0 && (
                        <div className="absolute top-2 left-2 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
                            {discount}% OFF
                        </div>
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
