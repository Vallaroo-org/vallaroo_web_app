'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SearchSuggestion {
    id: string;
    name: string;
    type: 'product' | 'service' | 'shop' | 'category';
    sub_text?: string;
    image_url?: string;
}

interface LocationFilters {
    state?: string;
    district?: string;
    town?: string;
}

export async function getSearchSuggestions(
    query: string,
    locationFilters?: LocationFilters
): Promise<SearchSuggestion[]> {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const { data, error } = await supabase.rpc('get_search_suggestions', {
        search_term: query.trim(),
        p_limit: 8,
        p_state: locationFilters?.state || null,
        p_district: locationFilters?.district || null,
        p_town: locationFilters?.town || null,
    });

    if (error) {
        console.error('Error fetching suggestions:', error);
        return [];
    }

    return data as SearchSuggestion[];
}
