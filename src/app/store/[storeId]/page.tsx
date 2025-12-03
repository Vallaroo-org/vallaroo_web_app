import { getSupabaseClient } from '@/lib/supabase';
import StoreView from '@/components/StoreView';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Using `props: any` because the params object is unexpectedly a Promise
export default async function StorePage(props: any) {
  const supabase = getSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  // Await the params promise to get the actual parameters
  const params = await props.params;
  const { storeId } = params;

  const { data: store, error: storeError } = await supabase
    .from('shops')
    .select('*')
    .eq('id', storeId)
    .single();

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .eq('shop_id', storeId);

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
        <StoreView store={store} products={products || []} />
      </main>
      <Footer />
    </div>
  );
}
