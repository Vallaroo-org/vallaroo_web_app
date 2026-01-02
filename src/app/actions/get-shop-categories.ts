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
        // Use !inner join to only get categories that have at least one active shop
        const { data, error } = await supabase
            .from('shop_categories')
            .select('id, name, name_ml, shops!inner(id)')
            .eq('shops.is_verified', true)
            .eq('shops.is_hidden', false)
            .eq('shops.hidden_by_admin', false)
            .order('name');

        if (error) {
            console.error('Error fetching shop categories:', error);
            return [];
        }

        const categories = data.map(({ shops, ...rest }) => rest);
        const uniqueCategories = Array.from(new Map(categories.map(item => [item.id, item])).values());

        return uniqueCategories as ShopCategory[];
    } catch (error) {
        console.error('Unexpected error fetching shop categories:', error);
        return [];
    }
}
