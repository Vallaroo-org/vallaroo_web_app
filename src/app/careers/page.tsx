'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Rocket } from 'lucide-react';

const CareersPage = () => {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />

            <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="bg-primary/10 p-6 rounded-full mb-8 animate-pulse">
                    <Rocket className="w-16 h-16 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Careers at Vallaroo
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg mb-8">
                    We are building something amazing. Open positions will be listed here soon.
                </p>
                <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium">
                    Coming Soon
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CareersPage;
