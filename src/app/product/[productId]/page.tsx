import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductDetailsClient from '@/components/ProductDetailsClient';
import { getProduct } from '@/app/actions/get-product';
import Link from 'next/link';

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const product = await getProduct(productId);

  if (!product) {
    return {
      title: 'Product Not Found | Vallaroo',
    };
  }

  return {
    title: `${product.name} | Vallaroo`,
    description: product.description?.slice(0, 160) || `Buy ${product.name} at the best price on Vallaroo`,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.image_urls?.[0] ? [product.image_urls[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const product = await getProduct(productId);

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-4">The product you are looking for does not exist or has been removed.</p>
          <Link href="/" className="text-primary hover:underline">Back to Home</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-screen-xl">
        <ProductDetailsClient product={product} />
      </main>
      <Footer />
    </div>
  );
}