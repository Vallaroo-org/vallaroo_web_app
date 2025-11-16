import ShareButton from '@/components/ShareButton';
import { supabase } from '@/lib/supabase';
import ProductList from '@/components/ProductList';
import Map from '@/components/Map';

export default async function StorePage({ params }: { params: { storeId: string } }) {
  const { storeId } = params;

  // Check if storeId is a valid UUID to prevent the query from running with an invalid value
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(storeId)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-gray-800">Invalid Store ID</h1>
          <p className="text-xl text-gray-600 mt-4">
            The provided store ID is not in a valid format.
          </p>
        </div>
      </div>
    );
  }

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
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-gray-800">404 - Store Not Found</h1>
          <p className="text-xl text-gray-600 mt-4">
            We couldn't find the store you're looking for.
          </p>
          <div className="mt-8 p-4 border rounded-md bg-red-50 text-left">
            <h3 className="font-bold text-red-800">Debugging Information:</h3>
            <pre className="mt-2 text-sm text-red-700 whitespace-pre-wrap">
              {JSON.stringify({
                storeId,
                storeFound: !!store,
                storeError,
              }, null, 2)}
            </pre>
          </div>
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
              {productsError && (
                <div className="mt-8 p-4 border rounded-md bg-red-50 text-left">
                  <h3 className="font-bold text-red-800">Products Error:</h3>
                  <pre className="mt-2 text-sm text-red-700 whitespace-pre-wrap">
                    {JSON.stringify(productsError, null, 2)}
                  </pre>
                </div>
              )}
              {products && <ProductList products={products} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
