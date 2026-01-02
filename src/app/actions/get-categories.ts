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
        // Use !inner join to only get categories that have at least one active product
        const { data, error } = await supabase
            .from('product_categories')
            // Explicitly use the foreign key to resolve ambiguity and join shops
            .select('id, name, name_ml, image_url, products:products!products_category_id_fkey!inner(id, shops!inner(id))')
            .eq('is_active', true)
            .eq('products.is_active', true)
            .eq('products.hidden_by_admin', false)
            .eq('products.shops.is_hidden', false)
            .eq('products.shops.hidden_by_admin', false)
            .eq('products.shops.is_verified', true)
            .order('sort_order', { ascending: true })
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching product categories:', error);
            return [];
        }

        // Filter is implicitly done by !inner join, but we map to return clean objects
        // The join returns products array, we just want the category fields
        const categories = data.map(({ products, ...rest }) => rest);

        // Remove duplicates if any (though unlikely with this query unless products cause cartesian which !inner shouldn't if we don't select many fields)
        // Actually, supabase join might duplicate parent rows if multiple children match.
        // We'll deduplicate manually to be safe.
        const uniqueCategories = Array.from(new Map(categories.map(item => [item.id, item])).values());

        return uniqueCategories as ProductCategory[];
    } catch (error) {
        console.error('Unexpected error fetching product categories:', error);
        return [];
    }
}

export async function getProductSubCategories(categoryId: string) {
    if (!categoryId) return [];

    try {
        // Use !inner join to only get subcategories that have active products
        const { data, error } = await supabase
            .from('product_sub_categories')
            .select('id, category_id, name, name_ml, products!inner(id, shops!inner(id))')
            .eq('category_id', categoryId)
            .eq('is_active', true)
            .eq('products.is_active', true)
            .eq('products.hidden_by_admin', false)
            .eq('products.shops.is_hidden', false)
            .eq('products.shops.hidden_by_admin', false)
            .eq('products.shops.is_verified', true)
            .order('sort_order', { ascending: true })
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching product sub-categories:', error);
            return [];
        }

        const subCats = data.map(({ products, ...rest }) => rest);

        // Deduplicate by name (case-insensitive) to handle potential DB duplicates
        const uniqueSubcats = subCats.reduce((acc: any[], current: any) => {
            const x = acc.find(item => item.name.toLowerCase() === current.name.toLowerCase());
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, []);

        return uniqueSubcats as ProductSubCategory[];
    } catch (error) {
        console.error('Unexpected error fetching product sub-categories:', error);
        return [];
    }
}
