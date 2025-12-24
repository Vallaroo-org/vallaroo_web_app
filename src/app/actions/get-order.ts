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

export async function getBillId(orderId: string): Promise<string | null> {
    const adminSupabase = createClient(
        supabaseUrl,
        process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
    );

    const { data, error } = await adminSupabase
        .from('bills')
        .select('id')
        .eq('metadata->>order_id', orderId)
        .maybeSingle();

    if (error) console.error('Error in getBillId:', error);
    console.log('getBillId result for', orderId, ':', data);

    return data?.id || null;
}
