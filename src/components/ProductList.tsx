'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Share2, MessageCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_urls: string[];
  category: string | null;
}

interface Shop {
  whatsapp_number: string;
}

interface ProductListProps {
  products: Product[];
  shop: Shop;
}

const ITEMS_PER_PAGE = 6;

const ProductCard = ({ product, shop }: { product: Product; shop: Shop }) => {
  const [selectedImage, setSelectedImage] = useState(product.image_urls?.[0] || null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleInquire = (e: React.MouseEvent) => {
    e.stopPropagation();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const productLink = `${baseUrl}/product/${product.id}`;
    const whatsappMessage = encodeURIComponent(`I'm interested in your product: ${product.name}. More details: ${productLink}`);
    const cleanedWhatsappNumber = shop.whatsapp_number.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanedWhatsappNumber.startsWith('91') ? cleanedWhatsappNumber : '91' + cleanedWhatsappNumber}?text=${whatsappMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const productLink = `${baseUrl}/product/${product.id}`;
    navigator.clipboard.writeText(productLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCardClick = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <div
      className="bg-card text-card-foreground rounded-2xl border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="relative w-full aspect-square bg-muted/50 flex items-center justify-center overflow-hidden">
        {selectedImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selectedImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground/50">
            <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-sm font-medium">No Image</span>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-4 group-hover:translate-x-0">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground shadow-sm hover:bg-background transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        {/* Thumbnails */}
        {product.image_urls && product.image_urls.length > 1 && (
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
            {product.image_urls.slice(0, 4).map((url, index) => (
              <button
                key={index}
                className={`relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImage === url ? 'border-primary ring-1 ring-primary/20' : 'border-transparent hover:border-border'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(url);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="flex-grow space-y-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
            <span className="text-lg font-bold text-primary whitespace-nowrap">₹{product.price.toFixed(0)}</span>
          </div>
          {product.category && (
            <span className="inline-block px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground capitalize">
              {product.category}
            </span>
          )}
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        </div>

        <div className="mt-5 pt-4 border-t border-border/50">
          <button
            onClick={handleInquire}
            className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 font-medium active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4" />
            Inquire on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductList = ({ products, shop }: ProductListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    const allCategories = products.map((p) => p.category).filter(Boolean) as string[];
    return ['all', ...Array.from(new Set(allCategories))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(
        (product) =>
          selectedCategory === 'all' || product.category === selectedCategory
      );
  }, [products, searchTerm, selectedCategory]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer transition-shadow"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} shop={shop} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found matching your criteria.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
