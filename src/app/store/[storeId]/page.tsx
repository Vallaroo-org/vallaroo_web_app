import { getSupabaseClient } from '@/lib/supabase';
import { getProducts } from '@/app/actions/get-products';
import StoreView from '@/components/StoreView';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Using `props: any` because the params object is unexpectedly a Promise in this environment
export default async function StorePage(props: any) {
  const supabase = getSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  // Await the params promise to get the actual parameters
  const params = await props.params;
  const { storeId } = params;

  // Optimized Fetching: Select only required fields for Store
  const { data: store, error: storeError } = await supabase
    .from('shops')
    .select('*, businesses!inner(is_hidden)')
    .eq('id', storeId)
    .eq('is_hidden', false)
    .eq('is_verified', true)
    .filter('businesses.is_hidden', 'eq', false)
    .single();

  // Use the Server Action for initial product fetch (Limit 20, specific fields)
  // This ensures Consistency with the "Load More" logic.
  let products: any[] = [];
  try {
    const result = await getProducts({ shopId: storeId, page: 1, limit: 20 });
    products = result.products;
  } catch (e) {
    console.error("Failed to fetch initial products", e);
  }

  const { data: stories } = await supabase
    .from('stories')
    .select('*')
    .eq('shop_id', storeId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true });

  if (storeError || !store) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-4xl font-bold mb-4">Store Not Found</h1>
            <p className="text-muted-foreground">The store you are looking for does not exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <StoreView store={store} products={products || []} stories={stories || []} />
      </main>
      <Footer />
    </div>
  );
}
