import { getSupabaseClient } from '@/lib/supabase';
import { getProducts } from '@/app/actions/get-products';
import { getServices } from '@/app/actions/get-services';
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
    if (store.shop_type !== 'service') {
      const result = await getProducts({ shopId: storeId, page: 1, limit: 20 });
      products = result.products;
    }
  } catch (e) {
    console.error("Failed to fetch initial products", e);
  }

  let services: any[] = [];
  try {
    if (store.shop_type === 'service' || store.shop_type === 'both') {
      const result = await getServices({ shopId: storeId, page: 1, limit: 20 });
      services = result.services;
    }
  } catch (e) {
    console.error("Failed to fetch initial services", e);
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

  // Handle Temporary Closure where shop is hidden
  if (store.is_temporarily_closed && store.hide_shop_during_closure) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 max-w-md mx-auto">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Temporarily Closed</h1>
            <p className="text-muted-foreground mb-6">
              {store.name} is currently closed.
              {store.closure_reason && <span className="block mt-2 italic">"{store.closure_reason}"</span>}
            </p>
            {store.closure_end_date && (
              <p className="text-sm text-muted-foreground border-t pt-4">
                Expected to reopen on: {new Date(store.closure_end_date).toLocaleDateString()}
              </p>
            )}
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
        <StoreView store={store} products={products || []} services={services || []} stories={stories || []} />
      </main>
      <Footer />
    </div>
  );
}
