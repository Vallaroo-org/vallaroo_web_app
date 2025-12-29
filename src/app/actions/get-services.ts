'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    image_urls: string[];
    name_ml?: string;
    description_ml?: string;
    is_active?: boolean;
    created_at?: string;
    shop_id?: string;
    duration_minutes?: number; // Potential field
    shop?: {
        id: string;
        name: string;
        whatsapp_number?: string;
        logo_url?: string;
        city?: string;
        latitude?: number;
        longitude?: number;
    }
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

interface GetServicesParams {
    shopId?: string;
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    sortBy?: SortOption;
}

export async function getServices({
    shopId,
    page = 1,
    limit = 20,
    search = '',
    categoryId = 'all',
    sortBy = 'newest',
}: GetServicesParams) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('services')
        .select(`
            *,
            shop:shops!inner (
                id,
                name,
                whatsapp_number,
                logo_url,
                city,
                latitude,
                longitude
            )
        `)
        .eq('is_active', true);

    if (shopId) {
        query = query.eq('shop_id', shopId);
    } else {
        // For global service search, only show services from verified and visible shops
        // Using the foreign table alias if possible, but with !inner join, filtering on the relation works
        query = query
            .eq('shops.is_verified', true)
            .eq('shops.is_hidden', false);
    }

    // Category Filter
    if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
    }

    // Search
    if (search) {
        let orClause = `name.ilike.%${search}%,description.ilike.%${search}%`;

        // Search in Service Categories
        // First find matching category IDs
        const { data: catData } = await supabase
            .from('service_categories')
            .select('id')
            .or(`name.ilike.%${search}%,name_ml.ilike.%${search}%`);

        if (catData && catData.length > 0) {
            const catIds = catData.map(c => `category_id.eq.${c.id}`).join(',');
            if (catIds) {
                // Supabase OR with multiple ID eqs is valid: id.eq.1,id.eq.2
                // Append to the orClause
                orClause += `,${catIds}`;
            }
        }

        query = query.or(orClause);
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

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching services:', error);
        throw new Error('Failed to fetch services');
    }

    return {
        services: data as Service[],
        hasMore: (data?.length ?? 0) === limit,
    };
}
