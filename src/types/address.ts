export interface Address {
    id: string;
    user_id: string;
    name: string; // e.g., "Home", "Work"
    recipient_name: string;
    phone_number: string;
    house_no: string;
    road_name: string;
    landmark?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
    is_default: boolean;
    address_text?: string; // Auto-generated full address text
    created_at?: string;
}

export type NewAddress = Omit<Address, 'id' | 'user_id' | 'created_at'>;
