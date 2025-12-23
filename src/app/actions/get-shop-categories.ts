'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ShopCategory {
    id: string;
    name: string;
    name_ml?: string;
    image_url?: string;
}

export async function getShopCategories() {
    try {
        const { data, error } = await supabase
            .from('shop_categories')
            .select('id, name, name_ml')
            .order('name');

        if (error) {
            console.error('Error fetching shop categories:', error);
            return [];
        }

        return data as ShopCategory[];
    } catch (error) {
        console.error('Unexpected error fetching shop categories:', error);
        return [];
    }
}
