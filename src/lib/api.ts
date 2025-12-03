import { supabase } from './supabaseClient';

export interface Shop {
    id: string;
    name: string;
    description: string | null;
    phone_number: string | null;
    address_line1: string | null;
    city: string | null;
    cover_image_url: string | null;
    logo_url: string | null;
    rating?: number; // Not in DB yet, can be calculated or mocked
    distance?: string; // Not in DB yet, can be calculated
    delivery_time?: string; // Not in DB yet
    latitude?: number;
    longitude?: number;
}

export interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    mrp: number;
    image_urls: string[] | null;
    shop_id: string;
    shops?: {
        name: string;
        phone_number: string | null;
    };
    category_id: string | null;
}

export const fetchShops = async (): Promise<Shop[]> => {
    const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching shops:', error);
        return [];
    }

    return data as Shop[];
};

export const fetchShop = async (id: string): Promise<Shop | null> => {
    const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching shop:', error);
        return null;
    }

    return data as Shop;
};

export const fetchProducts = async (limit = 20): Promise<Product[]> => {
    const { data, error } = await supabase
        .from('products')
        .select('*, shops(name, phone_number)')
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
        .select('*, shops(name, phone_number)')
        .eq('id', id)
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
