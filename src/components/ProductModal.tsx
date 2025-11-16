'use client';

import { Fragment } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  image: string;
  images: string[];
}

interface Shop {
  whatsapp_number: string;
}

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  shop: Shop;
}

const ProductModal = ({ product, onClose, shop }: ProductModalProps) => {
  if (!product) {
    return null;
  }

  const getProductImage = (p: Product) => {
    if (p.image_url) return p.image_url;
    if (p.image) return p.image;
    if (p.images && p.images.length > 0) return p.images[0];
    return null;
  };

  const imageUrl = getProductImage(product);
  const whatsappMessage = encodeURIComponent(`I'm interested in your product: ${product.name}`);
  const whatsappUrl = `https://wa.me/${shop.whatsapp_number}?text=${whatsappMessage}`;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-11/12 md:w-3/5 lg:w-1/2 max-w-4xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-center bg-gray-100 rounded-lg">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} className="max-h-96 object-contain rounded-lg" />
            ) : (
              <div className="w-full h-96 flex items-center justify-center text-gray-500">No Image</div>
            )}
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{product.name}</h2>
              <p className="text-2xl text-gray-700 mt-2">₹{product.price.toFixed(2)}</p>
              <p className="text-gray-600 mt-4">{product.description || 'No description available.'}</p>
            </div>
            <div className="mt-6">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
              >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413 0 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.456l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.655 4.398 1.803 6.12l-1.214 4.433 4.515-1.182z" />
                </svg>
                Inquire on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
