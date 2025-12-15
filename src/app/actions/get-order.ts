'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface OrderDetail {
    id: string;
    total_amount: number;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    created_at: string;
    status: string;
    shop: {
        name: string;
        logo_url?: string;
        location_name?: string;
        address?: string;
    };
    order_items: {
        quantity: number;
        total: number;
        product: {
            id: string;
            name: string;
            price: number;
            image_urls?: string[];
        };
    }[];
}

export async function getOrder(orderId: string): Promise<OrderDetail | null> {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            id, total_amount, customer_name, customer_phone, customer_address, created_at, status,
            shop:shops (name, logo_url, location_name, address),
            order_items (
                quantity,
                total,
                product:products (id, name, price, image_urls)
            )
        `)
        .eq('id', orderId)
        .single();

    if (error) {
        console.error('Error fetching order:', error);
        return null;
    }

    return data as unknown as OrderDetail;
}
