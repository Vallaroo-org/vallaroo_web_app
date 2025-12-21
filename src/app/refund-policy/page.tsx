'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function RefundPolicyPage() {
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
                            Cancellation & Refund Policy
                        </h1>
                        <p className="text-muted-foreground">
                            Last updated on Dec 9 2025
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
                        <div className="space-y-6 text-muted-foreground leading-relaxed">
                            <p>
                                ADAKAM JANARDHANAN SUSMITH believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:
                            </p>

                            <ul className="list-disc pl-5 space-y-4">
                                <li>
                                    Cancellations will be considered only if the request is made within Same day of placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.
                                </li>
                                <li>
                                    ADAKAM JANARDHANAN SUSMITH does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.
                                </li>
                                <li>
                                    In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within Same day of receipt of the products.
                                </li>
                                <li>
                                    In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within Same day of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision.
                                </li>
                                <li>
                                    In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them.
                                </li>
                                <li>
                                    In case of any Refunds approved by the ADAKAM JANARDHANAN SUSMITH, it'll take 1-2 days for the refund to be processed to the end customer.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
