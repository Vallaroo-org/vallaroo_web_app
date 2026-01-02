'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ServiceCategory {
    id: string;
    name: string;
    name_ml?: string;
    description?: string;
    image_url?: string;
}

export async function getServiceCategories() {
    try {
        // Use !inner join to only get categories that have at least one active service from a visible shop
        const { data, error } = await supabase
            .from('service_categories')
            .select('id, name, name_ml, description, image_url, services!inner(id, shops!inner(id))')
            .eq('services.is_active', true)
            .eq('services.hidden_by_admin', false)
            .eq('services.shops.is_hidden', false)
            .eq('services.shops.hidden_by_admin', false)
            .eq('services.shops.is_verified', true)
            .order('name');

        if (error) {
            console.error('Error fetching service categories:', error);
            return [];
        }

        // Deduplicate and clean up
        const categories = data.map(({ services, ...rest }) => rest);
        const uniqueCategories = Array.from(new Map(categories.map(item => [item.id, item])).values());

        return uniqueCategories as ServiceCategory[];
    } catch (error) {
        console.error('Unexpected error fetching service categories:', error);
        return [];
    }
}
