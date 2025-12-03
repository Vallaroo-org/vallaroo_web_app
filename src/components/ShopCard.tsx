import Link from 'next/link';

interface ShopCardProps {
    id: string;
    name: string;
    category: string;
    imageUrl: string;
    logoUrl: string | null;
    rating: number;
    distance: string;
    deliveryTime: string;
}

const ShopCard = ({ id, name, category, imageUrl, logoUrl, rating, distance, deliveryTime }: ShopCardProps) => {
    return (
        <Link href={`/store/${id}`} className="group block h-full">
            <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/50 h-full flex flex-col">
                {/* Banner Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={imageUrl}
                            alt={name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-muted-foreground/50">
                            <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                    )}
                </div>

                <div className="p-4 flex flex-col flex-1 relative">
                    {/* Logo (Overlapping Banner) */}
                    <div className="absolute -top-10 left-4 h-16 w-16 rounded-full border-4 border-card bg-card overflow-hidden shadow-sm">
                        {logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={logoUrl}
                                alt={`${name} logo`}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground font-bold text-xl">
                                {name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold tracking-tight text-lg group-hover:text-primary transition-colors">{name}</h3>
                            <p className="text-sm text-muted-foreground">{category}</p>
                        </div>
                        <div className="flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            <span>★ {rating.toFixed(1)}</span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span>{distance}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{deliveryTime}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ShopCard;
