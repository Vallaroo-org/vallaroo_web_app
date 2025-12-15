import Navbar from '@/components/Navbar';
import OrderDetailsClient from '@/components/OrderDetailsClient';
import { getOrder } from '@/app/actions/get-order';
import Link from 'next/link';

interface OrderPageProps {
    searchParams: Promise<{ id?: string }>;
}

export default async function OrderPage({ searchParams }: OrderPageProps) {
    const params = await searchParams;
    const orderId = params.id;

    if (!orderId) {
        return (
            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8">
                        <h1 className="text-2xl font-bold mb-2">Invalid Order Link</h1>
                        <p className="text-muted-foreground mb-4">No order ID provided.</p>
                        <Link href="/" className="text-primary hover:underline">Back to Home</Link>
                    </div>
                </main>
            </div>
        );
    }

    const order = await getOrder(orderId);

    if (!order) {
        return (
            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8">
                        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
                        <p className="text-muted-foreground mb-4">The order you are looking for does not exist.</p>
                        <p className="text-xs text-muted-foreground mb-4">ID: {orderId}</p>
                        <Link href="/" className="text-primary hover:underline">Back to Home</Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
            <Navbar />
            <main className="flex-1">
                <OrderDetailsClient order={order} />
            </main>
        </div>
    );
}
