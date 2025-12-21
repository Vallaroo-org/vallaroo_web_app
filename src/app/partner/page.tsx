'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { Store, Package, Users, ShoppingCart, BarChart, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const PartnerPage = () => {
    const { t } = useLanguage();

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-primary/5 py-16 lg:py-24">
                    <div className="container mx-auto px-4 max-w-screen-xl">
                        <div className="text-center max-w-3xl mx-auto">
                            <div className="bg-primary/20 text-primary py-1 px-4 rounded-full font-medium text-sm inline-flex mb-6">
                                For Business Owners
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                                Grow Your Business with Vallaroo
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground mb-10">
                                The complete business management solution. Manage multiple shops, track inventory,
                                process orders, and reach thousands of local customers.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="https://business.vallaroo.com"
                                    className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                                >
                                    Start Selling Now
                                </Link>
                                <Link
                                    href="/contact"
                                    className="bg-background border border-border text-foreground px-8 py-4 rounded-xl font-semibold hover:bg-accent transition-all"
                                >
                                    Contact Sales
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-20 bg-background">
                    <div className="container mx-auto px-4 max-w-screen-xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Tools for Your Shop</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Everything you need to run your business efficiently, all in one dashboard.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="bg-card p-8 rounded-2xl border border-border/50 hover:shadow-lg transition-all text-center">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                                    <Store className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Multi-Shop Management</h3>
                                <p className="text-muted-foreground">
                                    Manage multiple branches from a single login. Consistent branding and centralized control.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-card p-8 rounded-2xl border border-border/50 hover:shadow-lg transition-all text-center">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                                    <Package className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Inventory Tracking</h3>
                                <p className="text-muted-foreground">
                                    Real-time stock updates. Auto-disable products when out of stock. Never oversell again.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-card p-8 rounded-2xl border border-border/50 hover:shadow-lg transition-all text-center">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                                    <Users className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">CRM & Loyalty</h3>
                                <p className="text-muted-foreground">
                                    Know your customers. secure customer data and build loyalty with order history insights.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="bg-card p-8 rounded-2xl border border-border/50 hover:shadow-lg transition-all text-center">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                                    <ShoppingCart className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Order Processing</h3>
                                <p className="text-muted-foreground">
                                    Accept, pack, and ship orders instantly. Integrated with driver app for seamless delivery.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="bg-card p-8 rounded-2xl border border-border/50 hover:shadow-lg transition-all text-center">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                                    <BarChart className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Analytics</h3>
                                <p className="text-muted-foreground">
                                    Detailed reports on sales, top products, and revenue growth. Make data-driven decisions.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="bg-card p-8 rounded-2xl border border-border/50 hover:shadow-lg transition-all text-center">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Secure & Role-Based</h3>
                                <p className="text-muted-foreground">
                                    Give your staff limited access (e.g., cashier view only) while you maintain full admin control.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 bg-primary/5">
                    <div className="container mx-auto px-4 max-w-screen-xl text-center">
                        <h2 className="text-3xl font-bold mb-6">Join Thousands of Local Businesses</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                            Get your shop online in minutes. No technical skills required.
                        </p>
                        <Link
                            href="https://business.vallaroo.com/signup"
                            className="bg-primary text-primary-foreground px-10 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-block"
                        >
                            Register Your Shop
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default PartnerPage;
