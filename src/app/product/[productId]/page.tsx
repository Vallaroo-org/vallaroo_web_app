import { getSupabaseClient } from '@/lib/supabase';
import Image from 'next/image';

export default async function ProductDetailPage({ params }: { params: { productId: string } }) {
  const supabase = getSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { productId } = params;

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error || !product) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-gray-800">404 - Product Not Found</h1>
          <p className="text-xl text-gray-600 mt-4">
            We couldn't find the product you're looking for.
          </p>
          {error && (
            <div className="mt-8 p-4 border rounded-md bg-red-50 text-left">
              <h3 className="font-bold text-red-800">Debugging Information:</h3>
              <pre className="mt-2 text-sm text-red-700 whitespace-pre-wrap">
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  const getProductImage = (p: typeof product) => {
    if (p.image_url) return p.image_url;
    if (p.image) return p.image;
    if (p.images && p.images.length > 0) return p.images[0];
    return null;
  };

  const imageUrl = getProductImage(product);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                width={500}
                height={500}
                className="h-full w-full object-cover md:w-48"
              />
            ) : (
              <div className="h-full w-full md:w-48 bg-gray-200 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              {product.category}
            </div>
            <h1 className="block mt-1 text-3xl leading-tight font-medium text-black">
              {product.name}
            </h1>
            <p className="mt-2 text-gray-700 text-2xl">₹{product.price.toFixed(2)}</p>
            <p className="mt-4 text-gray-500">
              {product.description || 'No description available.'}
            </p>
            {/* Add more product details here if available */}
          </div>
        </div>
      </div>
    </div>
  );
}
