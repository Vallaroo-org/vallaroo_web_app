import { supabase } from './supabaseClient';

export interface Shop {
    id: string;
    name: string;
    name_ml?: string | null;
    description: string | null;
    description_ml?: string | null;
    phone_number: string | null;
    address_line1: string | null;
    city: string | null;
    city_ml?: string | null;
    cover_image_url: string | null;
    logo_url: string | null;
    rating?: number; // Not in DB yet, can be calculated or mocked
    distance?: string; // Not in DB yet, can be calculated
    delivery_time?: string; // Not in DB yet
    latitude?: number;
    longitude?: number;
    open_days?: string[];
}

export interface Product {
    id: string;
    name: string;
    name_ml?: string | null;
    description: string | null;
    description_ml?: string | null;
    price: number;
    mrp: number;
    image_urls: string[] | null;
    shop_id: string;
    shops?: {
        name: string;
        name_ml?: string | null;
        phone_number: string | null;
        logo_url?: string | null;
    };
    category_id: string | null;
}

export const fetchShops = async (limit = 20): Promise<Shop[]> => {
    const { data, error } = await supabase
        .from('shops')
        .select('*, businesses!inner(is_hidden)')
        .eq('is_hidden', false)
        .eq('hidden_by_admin', false)
        .eq('is_verified', true)
        .filter('businesses.is_hidden', 'eq', false)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching shops:', error);
        return [];
    }

    return data as Shop[];
};

export const fetchShop = async (id: string): Promise<Shop | null> => {
    const { data, error } = await supabase
        .from('shops')
        .select('*, businesses!inner(is_hidden)')
        .eq('id', id)
        .eq('is_hidden', false)
        .eq('hidden_by_admin', false)
        .eq('is_verified', true)
        .filter('businesses.is_hidden', 'eq', false)
        .single();

    if (error) {
        console.error('Error fetching shop:', error);
        return null;
    }

    return data as Shop;
};

export const fetchProducts = async (limit = 20): Promise<Product[]> => {
    // We need to filter by shop visibility AND business visibility
    // Since nested filtering can be tricky with aliases, we'll use !inner joins
    // and filter on the joined tables directly if possible, or use the path syntax carefully.

    // Note: 'shops.businesses.is_hidden' failed with "column businesses_2.is_hidden does not exist"
    // This suggests PostgREST is aliasing the nested join.
    // A safer way is to filter within the select statement for the join,
    // BUT Supabase JS doesn't support filtering inside select() easily for deep nested logic
    // that affects the top level row count unless using !inner.

    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            shops!inner(
                name,
                phone_number,
                logo_url,
                is_hidden,
                is_verified,
                businesses!inner(is_hidden)
            )
        `)
        .eq('hidden_by_admin', false)
        .eq('shops.is_hidden', false)
        .eq('shops.is_verified', true)
        .filter('shops.businesses.is_hidden', 'eq', false)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data as Product[];
};

export const fetchProduct = async (id: string): Promise<Product | null> => {
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            shops!inner(
                name,
                phone_number,
                logo_url,
                is_hidden,
                is_verified,
                businesses!inner(is_hidden)
            )
        `)
        .eq('id', id)
        .eq('hidden_by_admin', false)
        .eq('shops.is_hidden', false)
        .eq('shops.is_verified', true)
        .filter('shops.businesses.is_hidden', 'eq', false)
        .single();

    if (error) {
        console.error('Error fetching product:', error);
        return null;
    }

    return data as Product;
};

export interface Category {
    id: string;
    name: string;
}

export const fetchCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase
        .from('product_categories')
        .select('id, name')
        .order('name');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return data as Category[];
};
