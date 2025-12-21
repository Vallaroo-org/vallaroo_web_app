'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Target, Lightbulb, TrendingUp, Users, Award, Heart } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-primary/5 py-16 lg:py-24">
                    <div className="container mx-auto px-4 max-w-screen-xl">
                        <div className="text-center max-w-3xl mx-auto">
                            <div className="bg-primary/20 text-primary py-1 px-4 rounded-full font-medium text-sm inline-flex mb-6">
                                About Us
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                                Revolutionizing Local Commerce
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                                Welcome to Vallaroo, where innovation meets hyperlocal efficiency.
                                We empower businesses to streamline operations and connect with their local community instantly.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="py-20 bg-background">
                    <div className="container mx-auto px-4 max-w-screen-xl">
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all">
                                <Target className="w-12 h-12 text-primary mb-6" />
                                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    To empower businesses of all sizes to thrive in the digital age. By providing innovative
                                    and user-friendly logistical solutions, we aim to bridge the gap between local shops and modern consumers.
                                </p>
                            </div>
                            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all">
                                <Lightbulb className="w-12 h-12 text-primary mb-6" />
                                <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    We envision a future where every neighborhood store has enterprise-grade tools.
                                    A future where "local" means "convenient", "fast", and "technologically advanced".
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core Values */}
                <section className="py-20 bg-primary/5">
                    <div className="container mx-auto px-4 max-w-screen-xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
                            <p className="text-muted-foreground">The principles that drive our innovation every day.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-background p-8 rounded-2xl text-center shadow-sm">
                                <TrendingUp className="w-10 h-10 text-primary mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Innovation</h3>
                                <p className="text-muted-foreground text-sm">Constantly pushing boundaries to deliver cutting-edge solutions.</p>
                            </div>
                            <div className="bg-background p-8 rounded-2xl text-center shadow-sm">
                                <Users className="w-10 h-10 text-primary mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Customer First</h3>
                                <p className="text-muted-foreground text-sm">We believe in exceeding expectations for both shops and shoppers.</p>
                            </div>
                            <div className="bg-background p-8 rounded-2xl text-center shadow-sm">
                                <Heart className="w-10 h-10 text-primary mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Impact</h3>
                                <p className="text-muted-foreground text-sm">Creating tangible value for the local economy and communities.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section Removed as per request */}
            </main>

            <Footer />
        </div>
    );
};

export default AboutPage;
