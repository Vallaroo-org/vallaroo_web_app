import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServiceDetailsClient from '@/components/ServiceDetailsClient';
import { getService } from '@/app/actions/get-service';
import Link from 'next/link';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ serviceId: string }> }): Promise<Metadata> {
    const { serviceId } = await params;
    const service = await getService(serviceId);

    if (!service) {
        return {
            title: 'Service Not Found | Vallaroo',
        };
    }

    return {
        title: `${service.name} | Vallaroo Services`,
        description: service.description?.slice(0, 160) || `Check out ${service.name} services on Vallaroo`,
        openGraph: {
            title: service.name,
            description: service.description?.slice(0, 160),
            images: service.image_urls?.[0] ? [service.image_urls[0]] : [],
        },
    };
}

export default async function ServicePage({ params }: { params: Promise<{ serviceId: string }> }) {
    const { serviceId } = await params;
    const service = await getService(serviceId);

    if (!service) {
        return (
            <div className="flex min-h-screen flex-col bg-background">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
                    <h1 className="text-2xl font-bold mb-2">Service Not Found</h1>
                    <p className="text-muted-foreground mb-4">The service you are looking for does not exist or has been removed.</p>
                    <Link href="/" className="text-primary hover:underline">Back to Home</Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-screen-xl">
                <ServiceDetailsClient service={service} />
            </main>
            <Footer />
        </div>
    );
}
