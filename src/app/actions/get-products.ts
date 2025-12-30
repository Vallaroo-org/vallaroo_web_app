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
    // Location filters
    state?: string;
    district?: string;
    town?: string;
}

export async function getProducts({
    shopId,
    page = 1,
    limit = 20,
    search = '',
    category = 'all',
    globalCategory = 'all',
    sortBy = 'newest',
    state,
    district,
    town,
}: GetProductsParams) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Use RPC for search if search term is present
    if (search && search.trim().length > 0) {
        let globalCategoryId: string | null = null;
        let subCategoryId: string | null = null;

        // Resolve IDs for filters if needed (similar logic to below)
        if (globalCategory && globalCategory !== 'all') {
            const { data: catData } = await supabase
                .from('product_categories')
                .select('id')
                .ilike('name', globalCategory)
                .single();
            if (catData?.id) globalCategoryId = catData.id;
        }

        if (category && category !== 'all') {
            if (category.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                subCategoryId = category;
            } else {
                const { data: subData } = await supabase
                    .from('product_sub_categories')
                    .select('id')
                    .ilike('name', category)
                    .single();
                if (subData?.id) subCategoryId = subData.id;
            }
        }

        const { data, error } = await supabase.rpc('search_products', {
            search_term: search,
            p_limit: limit,
            p_offset: from,
            p_shop_id: shopId || null,
            p_category_id: subCategoryId,
            p_global_category_id: globalCategoryId,
            p_sort_by: sortBy
        });

        if (error) {
            console.error('Error in search_products RPC:', error);
            throw new Error('Failed to search products');
        }

        // Map RPC result to Product interface
        // RPC returns flat structure with shop_ prefix for shop details
        const mappedProducts = (data as any[]).map((item: any) => ({
            id: item.id,
            name: item.name,
            name_ml: item.name_ml,
            price: item.price,
            mrp: item.mrp,
            description: item.description,
            description_ml: item.description_ml,
            image_urls: item.image_urls,
            category_id: item.category_id,
            global_category: item.global_category,
            global_category_id: item.global_category_id,
            is_active: item.is_active,
            created_at: item.created_at,
            stock: item.stock,
            specifications: item.specifications,
            shop_id: item.shop_id,
            shops: {
                id: item.shop_id,
                name: item.shop_name,
                name_ml: item.shop_name_ml,
                phone_number: item.shop_phone,
                logo_url: item.shop_logo,
                latitude: item.shop_latitude,
                longitude: item.shop_longitude,
                is_verified: item.shop_is_verified,
                is_hidden: item.shop_is_hidden
            },
            // Legacy/helper fields
            category: item.category_id,
        }));

        return {
            products: mappedProducts as Product[],
            // Simplistic pagination check for now. RPC could return total count if improved.
            hasMore: mappedProducts.length === limit,
        };
    }

    // ORIGINAL LOGIC (No Search Term)
    // Select fields - include shops join for global view
    const selectFields = shopId
        ? 'id, name, name_ml, price, mrp, description, description_ml, image_urls, category_id, global_category, global_category_id, is_active, created_at, stock, specifications'
        : 'id, name, name_ml, price, mrp, description, description_ml, image_urls, category_id, global_category, global_category_id, is_active, created_at, stock, specifications, shop_id, shops!inner (id, name, name_ml, phone_number, logo_url, is_verified, is_hidden, latitude, longitude)';

    let query = supabase
        .from('products')
        .select(selectFields)
        .eq('is_active', true)
        .eq('hidden_by_admin', false);

    // Filter by shop only if shopId is provided
    if (shopId) {
        query = query.eq('shop_id', shopId);
    } else {
        // For global product search, only show products from verified and visible shops
        query = query
            .eq('shops.is_verified', true)
            .eq('shops.is_hidden', false);

        // Location filters
        if (town) {
            query = query.eq('shops.town', town);
        } else if (district) {
            query = query.eq('shops.district', district);
        } else if (state) {
            query = query.eq('shops.state', state);
        }
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
