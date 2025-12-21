'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { Smartphone, ShoppingBag, Store, Star, Search, Bell } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const AppsPage = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'customer' | 'business'>('customer');

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />

            <main className="flex-1">
                {/* Header */}
                <section className="bg-primary/5 py-12">
                    <div className="container mx-auto px-4 max-w-screen-xl text-center">
                        <h1 className="text-4xl font-bold mb-4">Download Vallaroo Apps</h1>
                        <p className="text-muted-foreground mb-8">Experience the best of Vallaroo on your mobile device.</p>

                        {/* Tabs */}
                        <div className="inline-flex p-1 bg-muted rounded-xl mx-auto mb-8">
                            <button
                                onClick={() => setActiveTab('customer')}
                                className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'customer'
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                For Shoppers
                            </button>
                            <button
                                onClick={() => setActiveTab('business')}
                                className={`px-8 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'business'
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                For Business
                            </button>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-4 max-w-screen-xl py-12">
                    {activeTab === 'customer' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                                <div>
                                    <div className="bg-primary/10 text-primary py-1 px-3 rounded-full text-xs font-bold inline-block mb-4">CUSTOMER APP</div>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Shop Smarter, Faster, Better.</h2>
                                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                        Get your groceries, food, and daily essentials delivered in minutes.
                                        Track your orders in real-time and enjoy exclusive app-only discounts.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link
                                            href="https://dihxruochfwayuwqhkiw.supabase.co/storage/v1/object/public/downloads/vallaroo-app.apk"
                                            className="flex items-center gap-3 bg-foreground text-background px-6 py-3 rounded-xl hover:bg-foreground/90 transition-all shadow-lg"
                                            target="_blank"
                                        >
                                            <Smartphone className="w-6 h-6" />
                                            <div className="text-left">
                                                <div className="text-[10px] font-medium opacity-80 uppercase tracking-wider">Download APK</div>
                                                <div className="font-bold leading-none">Android Direct</div>
                                            </div>
                                        </Link>
                                        {/* Placeholder for App Store / Play Store if available later */}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-6 mt-8">
                                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                            <Search className="w-8 h-8 text-primary mb-3" />
                                            <h3 className="font-bold mb-2">Smart Search</h3>
                                            <p className="text-sm text-muted-foreground">Find exactly what you need with instant search and filters.</p>
                                        </div>
                                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                            <Bell className="w-8 h-8 text-primary mb-3" />
                                            <h3 className="font-bold mb-2">Live Updates</h3>
                                            <p className="text-sm text-muted-foreground">Real-time order tracking and delivery notifications.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                            <Star className="w-8 h-8 text-primary mb-3" />
                                            <h3 className="font-bold mb-2">Rewards</h3>
                                            <p className="text-sm text-muted-foreground">Earn points on every purchase and redeem for discounts.</p>
                                        </div>
                                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                            <ShoppingBag className="w-8 h-8 text-primary mb-3" />
                                            <h3 className="font-bold mb-2">Easy Checkout</h3>
                                            <p className="text-sm text-muted-foreground">Save your favorite payment methods for 1-tap checkout.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                                <div className="order-2 md:order-1 grid grid-cols-2 gap-6">
                                    <div className="space-y-6">
                                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                            <Store className="w-8 h-8 text-primary mb-3" />
                                            <h3 className="font-bold mb-2">Shop Manager</h3>
                                            <p className="text-sm text-muted-foreground">Manage inventory and prices on the go.</p>
                                        </div>
                                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                            <ShoppingBag className="w-8 h-8 text-primary mb-3" />
                                            <h3 className="font-bold mb-2">Order Manager</h3>
                                            <p className="text-sm text-muted-foreground">Accept and process orders instantly.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6 mt-8">
                                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                            <Star className="w-8 h-8 text-primary mb-3" />
                                            <h3 className="font-bold mb-2">Analytics</h3>
                                            <p className="text-sm text-muted-foreground">View detailed sales reports and growth metrics.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="order-1 md:order-2">
                                    <div className="bg-primary/10 text-primary py-1 px-3 rounded-full text-xs font-bold inline-block mb-4">BUSINESS APP</div>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Manage Your Business on the Go.</h2>
                                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                        The Vallaroo Business app gives you the power to run your entire operation from your pocket.
                                        Never miss an order, no matter where you are.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link
                                            href="https://dihxruochfwayuwqhkiw.supabase.co/storage/v1/object/public/downloads/vallaroo-business-app.apk"
                                            className="flex items-center gap-3 bg-foreground text-background px-6 py-3 rounded-xl hover:bg-foreground/90 transition-all shadow-lg"
                                            target="_blank"
                                        >
                                            <Smartphone className="w-6 h-6" />
                                            <div className="text-left">
                                                <div className="text-[10px] font-medium opacity-80 uppercase tracking-wider">Download APK</div>
                                                <div className="font-bold leading-none">Android Direct</div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AppsPage;
