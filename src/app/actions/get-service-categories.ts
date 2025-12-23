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
        const { data, error } = await supabase
            .from('service_categories')
            .select('id, name, name_ml, description, image_url')
            .order('name');

        if (error) {
            console.error('Error fetching service categories:', error);
            return [];
        }

        return data as ServiceCategory[];
    } catch (error) {
        console.error('Unexpected error fetching service categories:', error);
        return [];
    }
}
