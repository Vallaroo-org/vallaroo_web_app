'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { Bike, Clock, DollarSign, MapPin, Smartphone, ShieldCheck } from 'lucide-react';

const DeliveryPage = () => {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-black text-white py-16 lg:py-24 relative overflow-hidden">
                    {/* Abstract BG Shapes */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="container mx-auto px-4 max-w-screen-xl relative z-10">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-primary text-black font-bold py-1 px-3 rounded-md text-xs uppercase tracking-wider">
                                        Join the Fleet
                                    </div>
                                    <div className="bg-white/20 text-white font-medium py-1 px-3 rounded-md text-xs uppercase tracking-wider backdrop-blur-sm border border-white/10">
                                        Coming Soon
                                    </div>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                                    Earn on your own schedule.
                                </h1>
                                <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
                                    Become a Vallaroo Delivery Partner. Flexible hours, great earnings, and instant payouts.
                                    Start riding today.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link
                                        href="https://dihxruochfwayuwqhkiw.supabase.co/storage/v1/object/public/downloads/vallaroo-driver-app.apk"
                                        className="bg-primary text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 inline-flex items-center justify-center gap-2"
                                    >
                                        <Smartphone className="w-5 h-5" /> Download Driver App
                                    </Link>
                                </div>
                            </div>
                            {/* Visual Placeholder for Driver Image */}
                            <div className="relative h-[400px] w-full bg-gradient-to-tr from-gray-900 to-gray-800 rounded-3xl flex items-center justify-center border border-white/10">
                                <Bike className="w-32 h-32 text-primary opacity-80" />
                                <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                                    <div className="text-2xl font-bold text-white">₹25,000+</div>
                                    <div className="text-xs text-gray-300">Potential monthly earnings</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits */}
                <section className="py-20 bg-background">
                    <div className="container mx-auto px-4 max-w-screen-xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">Why Ride with Vallaroo?</h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="p-6 rounded-2xl border border-border bg-card hover:bg-accent/50 transition-colors">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Great Earnings</h3>
                                <p className="text-muted-foreground">Competitive delivery fees + incentives. Keep 100% of your tips.</p>
                            </div>
                            <div className="p-6 rounded-2xl border border-border bg-card hover:bg-accent/50 transition-colors">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Flexible Hours</h3>
                                <p className="text-muted-foreground">You are the boss. Log in and log out whenever you want.</p>
                            </div>
                            <div className="p-6 rounded-2xl border border-border bg-card hover:bg-accent/50 transition-colors">
                                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Insurance Support</h3>
                                <p className="text-muted-foreground">Accidental insurance coverage while you are on active delivery duty.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="py-20 bg-muted/30">
                    <div className="container mx-auto px-4 max-w-screen-xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">How to Join</h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 text-center relative">
                            {/* Connector Line (Desktop) */}
                            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-1 bg-border -z-10"></div>

                            <div className="bg-background md:bg-transparent p-6 rounded-2xl">
                                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">1</div>
                                <h3 className="font-bold text-lg mb-2">Download App</h3>
                                <p className="text-muted-foreground">Get the Vallaroo Driver app on your Android device.</p>
                            </div>
                            <div className="bg-background md:bg-transparent p-6 rounded-2xl">
                                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">2</div>
                                <h3 className="font-bold text-lg mb-2">Register</h3>
                                <p className="text-muted-foreground">Upload your driving license, RC, and basic details.</p>
                            </div>
                            <div className="bg-background md:bg-transparent p-6 rounded-2xl">
                                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">3</div>
                                <h3 className="font-bold text-lg mb-2">Start Earning</h3>
                                <p className="text-muted-foreground">Once approved (usually 24h), go online and start getting orders.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default DeliveryPage;
