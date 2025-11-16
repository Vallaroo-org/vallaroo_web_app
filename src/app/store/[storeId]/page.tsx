import ShareButton from '@/components/ShareButton';
import { supabase } from '@/lib/supabase';
import type { NextPage } from 'next';
import ProductList from '@/components/ProductList';
import Map from '@/components/Map';

interface StorePageProps {
  params: {
    storeId: string;
  };
}

const StorePage: NextPage<StorePageProps> = async ({ params }) => {
  const { storeId } = params;

  const { data: store, error: storeError } = await supabase
    .from('shops')
    .select('*')
    .eq('id', storeId)
    .single();

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId);

  if (storeError || !store) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">404</h1>
          <p className="text-xl text-gray-600">Store not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <header className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full mr-6 flex-shrink-0">
                {store.logo_url && (
                  <img
                    src={store.logo_url}
                    alt={store.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                )}
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">{store.name}</h1>
                <p className="text-lg text-gray-600">{store.category}</p>
              </div>
            </div>
            <div className="flex items-center">
              <ShareButton />
            </div>
          </div>
        </header>

        {/* Store Details and Products Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Store Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Store Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Address</h3>
                  <p className="text-gray-600">{store.address}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Location</h3>
                  <div className="w-full h-64 bg-gray-200 rounded-md mt-2">
                    {store.lat && store.lng && <Map lat={store.lat} lng={store.lng} />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Products */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Products</h2>
              {productsError && <div className="text-red-500">Error loading products</div>}
              {products && <ProductList products={products} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePage;
