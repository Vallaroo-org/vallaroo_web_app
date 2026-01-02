'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Shop {
    id: string;
    name: string;
    name_ml?: string;
    city?: string;
    city_ml?: string;
    cover_image_url?: string;
    logo_url?: string;
    phone_number?: string;
    latitude?: number;
    longitude?: number;
    created_at?: string;
    open_days?: string[];
}

export type ShopSortOption = 'newest' | 'name_asc';

interface GetShopsParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    sortBy?: ShopSortOption;
    // Location filters
    state?: string;
    district?: string;
    town?: string;
}

export async function getShops({
    page = 1,
    limit = 20,
    search = '',
    categoryId = 'all',
    sortBy = 'newest',
    state,
    district,
    town,
}: GetShopsParams = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Select only columns that exist in the shops table
    let query = supabase
        .from('shops')
        .select('id, name, name_ml, city, city_ml, cover_image_url, logo_url, phone_number, latitude, longitude, created_at, category_id, open_days, state, district, town')
        .eq('is_hidden', false)
        .eq('hidden_by_admin', false)
        .eq('is_verified', true);

    // Location filters
    if (town) {
        query = query.eq('town', town);
    } else if (district) {
        query = query.eq('district', district);
    } else if (state) {
        query = query.eq('state', state);
    }

    // Category Filter
    if (categoryId && categoryId !== 'all') {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);

        if (isUUID) {
            query = query.eq('category_id', categoryId);
        } else {
            // Resolve category name to ID
            const { data: catData } = await supabase
                .from('shop_categories')
                .select('id')
                .ilike('name', categoryId)
                .single();

            if (catData?.id) {
                query = query.eq('category_id', catData.id);
            } else {
                // Name not found, return empty
                query = query.eq('category_id', '00000000-0000-0000-0000-000000000000');
            }
        }
    }

    // Search
    if (search && search.trim().length > 0) {
        const { data, error } = await supabase.rpc('search_shops', {
            search_term: search,
            p_limit: limit,
            p_offset: from,
            p_category_id: categoryId !== 'all' ? categoryId : null,
            p_sort_by: sortBy
        });

        if (error) {
            console.error('Error in search_shops RPC:', error);
            // Fallback or empty? Usually better to return empty than crash
            return {
                shops: [],
                hasMore: false,
            };
        }

        const mappedShops = (data as any[]).map((item: any) => ({
            id: item.id,
            name: item.name,
            name_ml: item.name_ml,
            city: item.city,
            city_ml: item.city_ml,
            cover_image_url: item.cover_image_url,
            logo_url: item.logo_url,
            phone_number: item.phone_number,
            latitude: item.latitude,
            longitude: item.longitude,
            created_at: item.created_at,
            category_id: item.category_id,
            open_days: item.open_days
        }));

        return {
            shops: mappedShops as Shop[],
            hasMore: mappedShops.length === limit,
        };
    }

    // Filter by type (if utilizing shop_type column 'product' | 'service' | 'both')
    // Currently we don't have a frontend filter for this in getShops params, but good to have ready.
    // If 'category' param is added later for 'Grocery' etc, we need that column.

    // Sort
    switch (sortBy) {
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

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching shops:', error.message);
        return {
            shops: [] as Shop[],
            hasMore: false,
        };
    }

    return {
        shops: (data || []) as Shop[],
        hasMore: (data?.length ?? 0) === limit,
    };
}
