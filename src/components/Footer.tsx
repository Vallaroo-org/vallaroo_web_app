import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container flex flex-col md:flex-row items-center justify-between py-6 mx-auto px-4 gap-4">
                <p className="text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Vallaroo. All rights reserved.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground text-center">
                    <Link href="/privacy" prefetch={false} className="hover:text-foreground transition-colors">Privacy Policy</Link>
                    <Link href="/terms" prefetch={false} className="hover:text-foreground transition-colors">Terms of Service</Link>
                    <Link href="/refund-policy" prefetch={false} className="hover:text-foreground transition-colors">Refund Policy</Link>
                    <Link href="/shipping-policy" prefetch={false} className="hover:text-foreground transition-colors">Shipping Policy</Link>
                    <Link href="/contact" prefetch={false} className="hover:text-foreground transition-colors">Contact Us</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
