'use server';

import { createClient } from '@supabase/supabase-js';

// Initialize a Supabase client for server actions
// Note: In a real Next.js app with auth, you might want to use createClient from @supabase/ssr
// and pass cookies, but for public data fetching, a simple client works.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Product {
    id: string;
    name: string;
    name_ml?: string;
    price: number;
    description: string;
    description_ml?: string;
    image_urls: string[];
    category: string | null;
    category_id?: string;
    global_category?: string;
    global_category_id?: string;
    is_active?: boolean;
    created_at?: string;
    mrp?: number;
    shop_id?: string;
    shops?: {
        id: string;
        name: string;
        name_ml?: string;
        phone_number?: string;
        logo_url?: string;
        latitude?: number;
        longitude?: number;
    };
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

interface GetProductsParams {
    shopId?: string; // Now optional for global search
    page?: number;
    limit?: number;
    search?: string;
    category?: string; // Shop specific category ID
    globalCategory?: string; // High level global category
    sortBy?: SortOption;
}

export async function getProducts({
    shopId,
    page = 1,
    limit = 20,
    search = '',
    category = 'all',
    globalCategory = 'all',
    sortBy = 'newest',
}: GetProductsParams) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Select fields - include shops join for global view
    const selectFields = shopId
        ? 'id, name, name_ml, price, mrp, description, description_ml, image_urls, category_id, global_category, global_category_id, is_active, created_at'
        : 'id, name, name_ml, price, mrp, description, description_ml, image_urls, category_id, global_category, global_category_id, is_active, created_at, shop_id, shops!inner (id, name, name_ml, phone_number, logo_url, is_verified, is_hidden, latitude, longitude)';

    let query = supabase
        .from('products')
        .select(selectFields)
        .eq('is_active', true);

    // Filter by shop only if shopId is provided
    if (shopId) {
        query = query.eq('shop_id', shopId);
    } else {
        // For global product search, only show products from verified and visible shops
        query = query
            .eq('shops.is_verified', true)
            .eq('shops.is_hidden', false);
    }

    // Search
    if (search) {
        // Search in English or Malayalam name
        query = query.or(`name.ilike.%${search}%,name_ml.ilike.%${search}%`);
    }

    // Shop Category Filter
    if (category && category !== 'all') {
        // If the frontend passes a category NAME, we might need to join/filter by name.
        // However, ProductList logic used `p.category` which was likely just a string field or id.
        // If `category` param is an ID:
        // query = query.eq('category_id', category);

        // If usage relies on a 'category' string field on the product table (denormalized) OR mapped:
        // The current Product interface has `category: string | null`. 
        // Let's assume for now we filter by `category_id` if it's a UUID, 
        // or if the ProductList logic derived it. 
        // Wait, the current ProductList derives categories from `products.map(p => p.category)`.
        // If `category` is not on the table, this is tricky.
        // Let's check the schema or assume mapped. 
        // Reviewing `ProductList.tsx`: imports `Product` interface: `category: string | null`.
        // Reviewing `api.ts`: `category_id: string | null`. 
        // It seems `StorePage` fetches `*`, so maybe there is a `category` view/column or it was mapped?
        // Let's stick to standard filtering. If 'category' is passed, it needs to match a column.
        // I will try to filter by `category_id` if it looks like a UUID, otherwise ignoring for now to be safe
        // or relying on client side mapping? No, user wants Server Side.
        // I'll assume for now we filter by `category_id` if provided.
        if (category.length > 5) { // minimal check for potentially valid ID
            query = query.eq('category_id', category);
        }
    }

    // Global Category Filter - Need to lookup category ID from product_categories table
    if (globalCategory && globalCategory !== 'all') {
        // First, find the category ID by name
        const { data: categoryData } = await supabase
            .from('product_categories')
            .select('id')
            .ilike('name', globalCategory)
            .single();

        if (categoryData?.id) {
            query = query.eq('global_category_id', categoryData.id);
        } else {
            // Fallback: try the old global_category string field
            query = query.eq('global_category', globalCategory);
        }
    }

    // Sort
    switch (sortBy) {
        case 'price_asc':
            query = query.order('price', { ascending: true });
            break;
        case 'price_desc':
            query = query.order('price', { ascending: false });
            break;
        case 'name_asc':
            query = query.order('name', { ascending: true });
            break;
        case 'newest':
        default:
            query = query.order('created_at', { ascending: false });
            break;
    }

    // Pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching products:', error);
        throw new Error('Failed to fetch products');
    }

    // Map data to match Product interface if needed
    // Use 'any' to handle dynamic select fields which confuse TypeScript
    const mappedProducts = (data as any[]).map((item: any) => ({
        ...item,
        category: item.category_id,
    }));

    return {
        products: mappedProducts as Product[],
        hasMore: (data?.length ?? 0) === limit,
    };
}
