'use client';

export default function StoreDetails({ store }: { store: any }) {
  const openMap = () => {
    let query;
    if (store.latitude && store.longitude) {
      query = `${store.latitude},${store.longitude}`;
    } else {
      const address = [
        store.address_line1,
        store.address_line2,
        store.city,
        store.state,
        store.postal_code,
        store.country,
      ]
        .filter(Boolean)
        .join(', ');
      if (address) {
        query = address;
      }
    }

    if (query) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      window.open(url, '_blank');
    }
  };

  const storeGallery = store.gallery_images || [];
  const displayImages = storeGallery.slice(0, 3);
  const hasMoreImages = storeGallery.length > 3;

  return (
    <div className="lg:col-span-1 space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Store Details</h2>
        <div className="space-y-4">
          {store.whatsapp_number && (
            <div>
              <h3 className="font-semibold text-gray-700">WhatsApp</h3>
              <p className="text-gray-600">{store.whatsapp_number}</p>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-700">Address</h3>
            <address className="text-gray-600 not-italic">
              {store.address_line1 && <div>{store.address_line1}</div>}
              {store.address_line2 && <div>{store.address_line2}</div>}
              {(store.city || store.state || store.postal_code) && (
                <div>
                  {store.city && <span>{store.city}, </span>}
                  {store.state && <span>{store.state} </span>}
                  {store.postal_code && - <span>{store.postal_code}</span>}
                </div>
              )}
              {store.country && <div>{store.country}</div>}
            </address>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700">Location</h3>
            <button
              onClick={openMap}
              className="mt-2 w-full inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
            >
              Open in Maps
            </button>
          </div>

          {/* Shop Gallery */}
          {storeGallery.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Gallery</h2>
              <div className="grid grid-cols-2 gap-4">
                {displayImages.map((image: string, index: number) => (
                  <div key={index} className="w-full h-32 bg-gray-200 rounded-md">
                    <img src={image} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                  </div>
                ))}
                {hasMoreImages && (
                  <div className="w-full h-32 bg-gray-800 rounded-md flex items-center justify-center text-white font-bold cursor-pointer">
                    See More
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
