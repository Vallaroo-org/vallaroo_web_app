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
    // Location filters
    state?: string;
    district?: string;
    town?: string;
}

export async function getServices({
    shopId,
    page = 1,
    limit = 20,
    search = '',
    categoryId = 'all',
    sortBy = 'newest',
    state,
    district,
    town,
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
        .eq('is_active', true)
        .eq('hidden_by_admin', false);

    if (shopId) {
        query = query.eq('shop_id', shopId);
    } else {
        // For global service search, only show services from verified and visible shops
        // Using the foreign table alias if possible, but with !inner join, filtering on the relation works
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

    // Category Filter
    if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
    }

    // Search
    if (search && search.trim().length > 0) {
        const { data, error } = await supabase.rpc('search_services', {
            search_term: search,
            p_limit: limit,
            p_offset: from,
            p_shop_id: shopId || null,
            p_category_id: categoryId !== 'all' ? categoryId : null,
            p_sort_by: sortBy
        });

        if (error) {
            console.error('Error in search_services RPC:', error);
            throw new Error('Failed to search services');
        }

        const mappedServices = (data as any[]).map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            image_urls: item.image_urls,
            name_ml: item.name_ml,
            description_ml: item.description_ml,
            is_active: item.is_active,
            created_at: item.created_at,
            shop_id: item.shop_id,
            duration_minutes: item.duration_minutes,
            shop: {
                id: item.shop_id,
                name: item.shop_name,
                whatsapp_number: item.shop_whatsapp,
                logo_url: item.shop_logo,
                city: item.shop_city,
                latitude: item.shop_latitude,
                longitude: item.shop_longitude
            }
        }));

        return {
            services: mappedServices as Service[],
            hasMore: mappedServices.length === limit,
        };
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
