'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ShippingPolicyPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />

            <main className="flex-1 py-12 lg:py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-12">
                        <div className="bg-primary/10 text-primary py-1 px-4 rounded-full font-medium text-sm inline-flex mb-6">
                            Legal
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                            Shipping & Delivery Policy
                        </h1>
                        <p className="text-muted-foreground">
                            Last updated on Dec 9 2025
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
                        <div className="space-y-6 text-muted-foreground leading-relaxed">
                            <p>
                                For International buyers, orders are shipped and delivered through registered international courier companies and/or International speed post only. For domestic buyers, orders are shipped through registered domestic courier companies and /or speed post only.
                            </p>
                            <p>
                                Orders are shipped within 0-7 days or as per the delivery date agreed at the time of order confirmation and delivering of the shipment subject to Courier Company / post office norms.
                            </p>
                            <p>
                                ADAKAM JANARDHANAN SUSMITH is not liable for any delay in delivery by the courier company / postal authorities and only guarantees to hand over the consignment to the courier company or postal authorities within 0-7 days rom the date of the order and payment or as per the delivery date agreed at the time of order confirmation.
                            </p>
                            <p>
                                Delivery of all orders will be to the address provided by the buyer. Delivery of our services will be confirmed on your mail ID as specified during registration.
                            </p>
                            <p>
                                For any issues in utilizing our services you may contact our helpdesk on 8137946044 or support@vallaroo.com
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
