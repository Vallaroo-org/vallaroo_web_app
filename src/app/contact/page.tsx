'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Mail, MapPin, Phone, Building2 } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />

            <main className="flex-1 py-16 lg:py-24">
                <div className="container mx-auto px-4 max-w-screen-xl">
                    <div className="text-center mb-16">
                        <div className="bg-primary/10 text-primary py-1 px-4 rounded-full font-medium text-sm inline-flex mb-6">
                            Get in Touch
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            We're here to help
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Have questions about your order, interest in partnering, or just want to say hello?
                            We'd love to hear from you.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
                        <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all text-center group">
                            <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Headquarters</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Adakam House, Kallar,<br />
                                Rajapuram, Kasargod<br />
                                Keralam, 671532
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all text-center group">
                            <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Phone className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Phone Support</h3>
                            <p className="text-muted-foreground mb-4">
                                Mon-Fri from 9am to 6pm.
                            </p>
                            <a href="tel:+918137946044" className="text-primary font-bold hover:underline text-lg">
                                +91 8137946044
                            </a>
                        </div>

                        <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all text-center group">
                            <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Mail className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Email</h3>
                            <p className="text-muted-foreground mb-4">
                                For general inquiries and support.
                            </p>
                            <a href="mailto:support@vallaroo.com" className="text-primary font-bold hover:underline text-lg">
                                support@vallaroo.com
                            </a>
                        </div>
                    </div>

                    {/* Legal Entity Info (Required for Payment Gateways) */}
                    <div className="max-w-3xl mx-auto bg-muted/30 border border-border rounded-xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Building2 className="w-5 h-5 text-muted-foreground" />
                            <h2 className="text-lg font-bold">Regulatory Information</h2>
                        </div>

                        <div className="space-y-4 text-sm text-muted-foreground">
                            <div className="grid sm:grid-cols-3 gap-2">
                                <span className="font-semibold text-foreground">Merchant Name:</span>
                                <span className="sm:col-span-2">ADAKAM JANARDHANAN SUSMITH</span>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-2">
                                <span className="font-semibold text-foreground">Registered Address:</span>
                                <span className="sm:col-span-2">Adakam House, Kallar, Rajapuram, Kasargod, Kanhangad, KERALA 671532</span>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-2">
                                <span className="font-semibold text-foreground">Operational Address:</span>
                                <span className="sm:col-span-2">Adakam House, Kallar, Rajapuram, Kasargod, Kanhangad, KERALA 671532</span>
                            </div>
                            <div className="pt-4 text-xs opacity-70">
                                Last updated on Dec 9 2025
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
