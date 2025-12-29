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
    stock?: number;
    specifications?: any;
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
        ? 'id, name, name_ml, price, mrp, description, description_ml, image_urls, category_id, global_category, global_category_id, is_active, created_at, stock, specifications'
        : 'id, name, name_ml, price, mrp, description, description_ml, image_urls, category_id, global_category, global_category_id, is_active, created_at, stock, specifications, shop_id, shops!inner (id, name, name_ml, phone_number, logo_url, is_verified, is_hidden, latitude, longitude)';

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
        // Search in English or Malayalam name, description, or global category
        query = query.or(`name.ilike.%${search}%,name_ml.ilike.%${search}%,description.ilike.%${search}%,global_category.ilike.%${search}%`);
    }

    // Sub-Category Filter (previously 'category' param)
    if (category && category !== 'all') {
        // If category looks like a UUID, use it directly
        if (category.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            query = query.eq('global_sub_category_id', category);
        } else {
            // Otherwise, treat it as a sub-category NAME and look up the ID
            const { data: subCatData } = await supabase
                .from('product_sub_categories')
                .select('id')
                .ilike('name', category)
                .single();

            if (subCatData?.id) {
                query = query.eq('global_sub_category_id', subCatData.id);
            } else {
                console.warn(`Sub-category not found: ${category}`);
                // Optionally: don't filter or return empty? 
                // If name not found, likely no products will match if we filtered by known ID.
                // Let's filter by a dummy ID to return 0 results if name is invalid to be safe.
                query = query.eq('global_sub_category_id', '00000000-0000-0000-0000-000000000000');
            }
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
