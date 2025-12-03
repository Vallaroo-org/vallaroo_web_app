import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container flex items-center justify-center py-6 mx-auto px-4">
                <p className="text-center text-sm text-muted-foreground">
                    Built by Vallaroo Team.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
