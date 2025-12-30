'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ProductDetail {
    id: string;
    name: string;
    name_ml?: string;
    price: number;
    mrp: number;
    description: string;
    description_ml?: string;
    image_urls: string[];
    shop_id: string;
    shops?: {
        id: string;
        name: string;
        name_ml?: string;
        phone_number?: string;
        logo_url?: string;
    };
    stock?: number;
    specifications?: any;
    // New fields
    brand_name?: string;
    brand_name_ml?: string;
    unit?: string;
    unit_ml?: string;
    warranty_period?: string;
    manufacturing_date?: string;
    expiry_date?: string;
}

export async function getProduct(productId: string): Promise<ProductDetail | null> {
    const { data, error } = await supabase
        .from('products')
        .select(`
            id, name, name_ml, price, mrp, description, description_ml, image_urls, shop_id, stock, specifications,
            brand_name, brand_name_ml, unit, unit_ml, warranty_period, manufacturing_date, expiry_date,
            shops!inner (id, name, name_ml, phone_number, logo_url, is_hidden, is_verified, businesses!inner(is_hidden))
        `)
        .eq('id', productId)
        .eq('is_active', true)
        .eq('hidden_by_admin', false)
        .eq('shops.is_hidden', false)
        .eq('shops.is_verified', true)
        .eq('shops.businesses.is_hidden', false)
        .single();

    if (error) {
        console.error('Error fetching product:', error);
        return null;
    }

    // Map to clean interface
    return {
        ...data,
        shops: data.shops ? {
            id: (data.shops as any).id,
            name: (data.shops as any).name,
            name_ml: (data.shops as any).name_ml,
            phone_number: (data.shops as any).phone_number,
            logo_url: (data.shops as any).logo_url,
        } : undefined,
    } as ProductDetail;
}
