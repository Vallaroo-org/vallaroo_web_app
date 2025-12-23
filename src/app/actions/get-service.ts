import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Service {
    id: string;
    name: string;
    description?: string;
    price: number;
    image_urls?: string[];
    shop_id: string;
    is_active: boolean;
    name_ml?: string;
    description_ml?: string;
}

export interface Shop {
    id: string;
    name: string;
    name_ml?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    phone_number?: string;
    whatsapp_number?: string;
    logo_url?: string;
    cover_image_url?: string;
    rating?: number;
    latitude?: number;
    longitude?: number;
    is_verified?: boolean;
}

export interface ServiceWithShop extends Service {
    shop?: Shop;
    shop_data?: {
        name: string;
        whatsapp_number?: string;
        logo_url?: string;
    }; // For compatibility if needed, but prefer joined shop object
}

export async function getService(serviceId: string): Promise<ServiceWithShop | null> {
    // Validate UUID format to prevent database errors on invalid IDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(serviceId)) {
        console.warn(`Invalid serviceId format: ${serviceId}`);
        return null;
    }

    try {
        const { data: service, error } = await supabase
            .from('services')
            .select(`
                *,
                shop:shops (
                    id,
                    name,
                    name_ml,
                    address_line1,
                    city,
                    phone_number,
                    whatsapp_number,
                    logo_url,
                    cover_image_url,
                    is_verified
                )
            `)
            .eq('id', serviceId)
            .maybeSingle();

        if (error) {
            console.error(`Error fetching service with ID ${serviceId}:`, JSON.stringify(error, null, 2));
            console.error('Error details:', error.message, error.details, error.hint);
            return null;
        }

        return service as ServiceWithShop;
    } catch (error) {
        console.error('Unexpected error fetching service:', error);
        return null;
    }
}
