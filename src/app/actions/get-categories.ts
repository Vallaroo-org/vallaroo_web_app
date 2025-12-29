'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ProductCategory {
    id: string;
    name: string;
    name_ml?: string;
    image_url?: string;
    created_at?: string;
}

export interface ProductSubCategory {
    id: string;
    category_id: string;
    name: string;
    name_ml?: string;
    created_at?: string;
}

export async function getProductCategories() {
    try {
        const { data, error } = await supabase
            .from('product_categories')
            .select('id, name, name_ml, image_url')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching product categories:', error);
            return [];
        }

        return data as ProductCategory[];
    } catch (error) {
        console.error('Unexpected error fetching product categories:', error);
        return [];
    }
}

export async function getProductSubCategories(categoryId: string) {
    if (!categoryId) return [];

    try {
        const { data, error } = await supabase
            .from('product_sub_categories')
            .select('id, category_id, name, name_ml')
            .eq('category_id', categoryId)
            .eq('is_active', true)
            .order('sort_order', { ascending: true })
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching product sub-categories:', error);
            return [];
        }

        return data as ProductSubCategory[];
    } catch (error) {
        console.error('Unexpected error fetching product sub-categories:', error);
        return [];
    }
}
