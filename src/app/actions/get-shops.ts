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
}

export type ShopSortOption = 'newest' | 'name_asc';

interface GetShopsParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: ShopSortOption;
}

export async function getShops({
    page = 1,
    limit = 20,
    search = '',
    sortBy = 'newest',
}: GetShopsParams = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Select only columns that exist in the shops table
    let query = supabase
        .from('shops')
        .select('id, name, name_ml, city, city_ml, cover_image_url, logo_url, phone_number, latitude, longitude, created_at')
        .eq('is_hidden', false)
        .eq('is_verified', true);

    // Search
    if (search) {
        query = query.or(`name.ilike.%${search}%,name_ml.ilike.%${search}%,city.ilike.%${search}%`);
    }

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
