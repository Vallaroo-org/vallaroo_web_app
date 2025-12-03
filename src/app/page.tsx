'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ShopCard from '../components/ShopCard';
import ProductCard from '../components/ProductCard';
import { fetchShops, fetchProducts, fetchCategories, Shop, Product, Category } from '../lib/api';
import { Search } from 'lucide-react';

const DiscoverPage = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'shops' | 'products'>('shops');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [shopsData, productsData, categoriesData] = await Promise.all([
          fetchShops(),
          fetchProducts(),
          fetchCategories()
        ]);
        setShops(shopsData);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredShops = shops.filter((shop) => {
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (shop.city && shop.city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = activeCategory === 'All' ||
      shop.name.toLowerCase().includes(activeCategory.toLowerCase()) ||
      (shop.description && shop.description.toLowerCase().includes(activeCategory.toLowerCase())) ||
      (shop.city && shop.city.toLowerCase().includes(activeCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.shops?.name && product.shops.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const categoryName = categories.find(c => c.id === product.category_id)?.name;

    const matchesCategory = activeCategory === 'All' ||
      categoryName === activeCategory ||
      product.name.toLowerCase().includes(activeCategory.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(activeCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-300">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-screen-2xl">
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Discover Local</h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore the best local businesses and unique products around you.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-lg">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <input
              type="search"
              className="block w-full p-4 pl-10 text-sm border border-input rounded-xl bg-card text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none shadow-sm transition-all placeholder:text-muted-foreground"
              placeholder={`Search for ${activeTab === 'shops' ? 'stores' : 'products'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 rounded-xl bg-muted p-1 mb-8 max-w-md">
          <button
            onClick={() => setActiveTab('shops')}
            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 focus:outline-none focus:ring-2 ring-offset-2 ring-offset-background focus:ring-primary ${activeTab === 'shops'
              ? 'bg-background shadow-md text-foreground'
              : 'text-muted-foreground hover:bg-background/50 hover:text-foreground hover:shadow-sm'
              }`}
          >
            Shops
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 focus:outline-none focus:ring-2 ring-offset-2 ring-offset-background focus:ring-primary ${activeTab === 'products'
              ? 'bg-background shadow-md text-foreground'
              : 'text-muted-foreground hover:bg-background/50 hover:text-foreground hover:shadow-sm'
              }`}
          >
            Products
          </button>
        </div>

        {/* Categories / Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === 'All'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-card-foreground border-border hover:bg-accent hover:text-accent-foreground'
              }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat.name
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-card-foreground border-border hover:bg-accent hover:text-accent-foreground'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'shops' ? (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold tracking-tight">Nearby Shops</h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-64 rounded-lg bg-muted animate-pulse"></div>
                ))}
              </div>
            ) : filteredShops.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredShops.map((shop) => (
                  <ShopCard
                    key={shop.id}
                    id={shop.id}
                    name={shop.name}
                    category={shop.city || 'Local Store'}
                    imageUrl={shop.cover_image_url || ''}
                    logoUrl={shop.logo_url}
                    rating={shop.rating || 0}
                    distance={shop.distance || 'Nearby'}
                    deliveryTime={shop.delivery_time || 'Standard'}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No shops found matching your search.</p>
              </div>
            )}
          </section>
        ) : (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold tracking-tight">Fresh Finds</h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-48 rounded-lg bg-muted animate-pulse"></div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    mrp={product.mrp}
                    imageUrl={product.image_urls?.[0] || null}
                    shopName={product.shops?.name || 'Unknown Shop'}
                    category={categories.find(c => c.id === product.category_id)?.name}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No products found matching your search.</p>
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DiscoverPage;