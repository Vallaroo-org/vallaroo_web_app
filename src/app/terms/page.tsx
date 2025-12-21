'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function TermsPage() {
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
                            Terms & Conditions
                        </h1>
                        <p className="text-muted-foreground">
                            Last updated on Dec 9 2025
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
                        <div className="space-y-6 text-muted-foreground leading-relaxed">
                            <p>
                                For the purpose of these Terms and Conditions, The term "we", "us", "our" used anywhere on this page shall mean ADAKAM JANARDHANAN SUSMITH, whose registered/operational office is Adakam House, Kallar, Rajapuram, Kasargod kanhangad KERALA 671532 . "you", "your", "user", "visitor" shall mean any natural or legal person who is visiting our website and/or agreed to purchase from us.
                            </p>
                            <p>
                                Your use of the website and/or purchase from us are governed by following Terms and Conditions:
                            </p>
                            <ul className="list-disc pl-5 space-y-4">
                                <li>The content of the pages of this website is subject to change without notice.</li>
                                <li>Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.</li>
                                <li>Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through our website and/or product pages meet your specific requirements.</li>
                                <li>Our website contains material which is owned by or licensed to us. This material includes, but are not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.</li>
                                <li>All trademarks reproduced in our website which are not the property of, or licensed to, the operator are acknowledged on the website.</li>
                                <li>Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offense.</li>
                                <li>From time to time our website may also include links to other websites. These links are provided for your convenience to provide further information.</li>
                                <li>You may not create a link to our website from another website or document without ADAKAM JANARDHANAN SUSMITH's prior written consent.</li>
                                <li>Any dispute arising out of use of our website and/or purchase with us and/or any engagement with us is subject to the laws of India .</li>
                                <li>We, shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction, on Account of the Cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
