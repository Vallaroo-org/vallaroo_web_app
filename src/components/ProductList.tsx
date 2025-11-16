'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

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
      className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-500">No Image</span>
        )}
      </div>
      {product.image_urls && product.image_urls.length > 1 && (
        <div className="flex justify-center p-2 space-x-2 bg-gray-100">
          {product.image_urls.map((url, index) => (
            <div
              key={index}
              className={`w-12 h-12 border-2 rounded-md cursor-pointer ${selectedImage === url ? 'border-blue-500' : 'border-transparent'}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(url);
              }}
            >
              <img
                src={url}
                alt={`${product.name} thumbnail ${index + 1}`}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          ))}
        </div>
      )}
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
          <p className="text-gray-600 mt-1">₹{product.price.toFixed(2)}</p>
        </div>
        <div className="flex items-center space-x-2 mt-4">
          <button
            onClick={handleInquire}
            className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Inquire
          </button>
          <button
            onClick={handleShare}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            {copied ? 'Copied!' : 'Share'}
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
      <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full sm:w-auto border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="w-full sm:w-auto border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} shop={shop} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mr-4 disabled:bg-gray-300"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="bg-blue-500 text-white px-4 py-2 rounded-md ml-4 disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
