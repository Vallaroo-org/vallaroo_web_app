import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Smartphone, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#0f172a] text-slate-300 pt-16 pb-8">
            <div className="container mx-auto px-4 max-w-screen-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="font-bold text-2xl flex items-center gap-2 mb-6 text-white">
                            <span>Vallaroo</span>
                        </Link>
                        <p className="text-sm text-slate-400 mb-8 max-w-sm leading-relaxed">
                            Vallaroo is your local commerce super-app. From fresh groceries to fashion,
                            get everything delivered from your trusted neighborhood stores in minutes.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Facebook className="w-5 h-5" /></Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Instagram className="w-5 h-5" /></Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Linkedin className="w-5 h-5" /></Link>
                        </div>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Company</h3>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div>
                        <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">For You</h3>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link href="/partner" className="hover:text-white transition-colors flex items-center gap-2">Sell on Vallaroo</Link></li>
                            <li><Link href="/delivery" className="hover:text-white transition-colors flex items-center gap-2">Become a Partner</Link></li>
                            <li><Link href="/apps" className="hover:text-white transition-colors">Get the App</Link></li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Legal</h3>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
                            <li><Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Cities / Expansion Placeholder (Like Swiggy) */}
                <div className="border-t border-slate-800 pt-8 pb-8">
                    <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                        We Deliver To <span className="text-xs normal-case bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">(Coming Soon)</span>
                    </h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                        <span>Kochi</span>
                        <span>Thiruvananthapuram</span>
                        <span>Kozhikode</span>
                        <span>Thrissur</span>
                        <span>Kollam</span>
                        <span>Alappuzha</span>
                        <span>Kannur</span>
                        <span>Kottayam</span>
                        <span>Palakkad</span>
                        <span>Malappuram</span>
                        <span>Wayanad</span>
                        <span>Idukki</span>
                        <span>Pathanamthitta</span>
                        <span>Kasaragod</span>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Vallaroo Technologies Pvt Ltd. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
