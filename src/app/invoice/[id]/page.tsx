'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Adjusted import for Customer Web
import { Loader2, Printer, Share2, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

// Types (simplified or imported if available)
interface BillItem {
    name: string;
    name_ml?: string;
    quantity: number;
    unit: string;
    price: number;
    total: number;
}

interface Bill {
    id: string;
    bill_number: string;
    issued_at: string;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    items: BillItem[];
    subtotal: number;
    discount: number;
    delivery_charge?: number;
    total: number;
    paid_amount?: number;
    payment_status?: string;
    shop_id: string;
    shop?: {
        name: string;
        phone_number?: string;
        address_line1?: string;
        city?: string;
        upi_id?: string;
        qr_code_url?: string;
    }
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
};

export default function CustomerInvoicePage() {
    const router = useRouter();
    const params = useParams();
    const billId = params?.id as string; // Assuming route is /invoice/[id]

    const [bill, setBill] = useState<Bill | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBill = async () => {
            try {
                // Fetch bill with items and shop details
                const { data, error } = await supabase
                    .from('bills')
                    .select('*, items:bill_items(*), shop:shops(name, phone_number, address_line1, city, upi_id, qr_code_url)')
                    .eq('id', billId)
                    .single();

                if (error) throw error;
                setBill(data);
            } catch (error) {
                console.error('Error fetching invoice:', error);
                // alert('Invoice not found');
                // router.push('/profile/orders'); 
            } finally {
                setLoading(false);
            }
        };
        if (billId) fetchBill();
    }, [billId]);

    useEffect(() => {
        if (bill) {
            document.title = `Invoice #${bill.bill_number}`;
        }
    }, [bill]);

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `invoice-${bill?.bill_number || 'bill'}`;
        window.print();
        document.title = originalTitle;
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Invoice #${bill?.bill_number}`,
                    text: `Invoice from ${bill?.shop?.name}`,
                    url: window.location.href,
                });
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error('Error sharing:', error);
                }
            }
        } else {
            alert('Sharing is not supported on this browser/device.');
        }
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>;
    }

    if (!bill) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-8 gap-4">
                <p className="text-muted-foreground">Invoice not found or you do not have permission to view it.</p>
                <Link href="/profile/orders" className="text-blue-600 hover:underline">Back to Orders</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 text-black p-4 md:p-8 print:p-0 print:min-h-0 print:h-auto font-sans">
            {/* Toolbar - Hidden when printing */}
            <div className="max-w-3xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                <Link href="/profile/orders" className="flex items-center text-gray-600 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Orders
                </Link>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleShare}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Print / Save PDF
                    </button>
                </div>
            </div>

            {/* Invoice Container */}
            <div className="max-w-3xl mx-auto bg-white border border-gray-200 shadow-sm rounded-xl print:border-none print:shadow-none p-8 md:p-12 print:p-0" id="invoice-content">

                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-900 mb-1">{bill.shop?.name}</h1>
                        {bill.shop?.address_line1 && <p className="text-sm text-gray-500 mt-1">{bill.shop.address_line1}</p>}
                        {bill.shop?.city && <p className="text-sm text-gray-500">{bill.shop.city}</p>}
                        {bill.shop?.phone_number && <p className="text-sm text-gray-500 mt-1">Phone: {bill.shop.phone_number}</p>}
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-light text-gray-400 uppercase tracking-widest mb-2">Invoice</h2>
                        <div className="text-sm text-gray-600">
                            <p className="font-semibold">#{bill.bill_number}</p>
                            <p>{new Date(bill.issued_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(bill.issued_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 my-8"></div>

                {/* Bill To */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h3>
                    {bill.customer_name ? (
                        <>
                            <p className="font-semibold text-gray-900">{bill.customer_name}</p>
                            {!bill.customer_address && bill.customer_phone && <p className="text-sm text-gray-600">Phone: {bill.customer_phone}</p>}

                            {bill.customer_address && (
                                <div className="text-sm text-gray-600 mt-1">
                                    {bill.customer_address.split(',').map((part, i) => (
                                        <div key={i}>{part.trim()}</div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-gray-500 italic">Walking Customer</p>
                    )}
                </div>

                {/* Items Table */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-gray-100">
                            <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                            <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bill.items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="py-4 text-sm text-gray-900">
                                    <div className="font-medium">{item.name}</div>
                                    {item.name_ml && <div className="text-xs text-gray-400">{item.name_ml}</div>}
                                </td>
                                <td className="py-4 text-right text-sm text-gray-600">{item.quantity} {item.unit}</td>
                                <td className="py-4 text-right text-sm text-gray-600">
                                    {formatCurrency(item.price)}
                                </td>
                                <td className="py-4 text-right text-sm font-medium text-gray-900">
                                    {formatCurrency(item.price * item.quantity)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals & QR Code Section */}
                <div className="flex flex-col md:flex-row justify-between items-start mt-8 gap-8">

                    {/* QR Code */}
                    <div className="w-full md:w-1/2">
                        {bill.shop?.upi_id && (bill.total - (bill.paid_amount || 0) > 0) && (
                            <div className="flex flex-col items-center md:items-start border p-4 rounded-lg bg-gray-50 max-w-[200px]">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                                        `upi://pay?pa=${bill.shop.upi_id}&pn=${encodeURIComponent(bill.shop.name)}&am=${(bill.total - (bill.paid_amount || 0)).toFixed(2)}&cu=INR`
                                    )}`}
                                    alt="Payment QR"
                                    className="w-24 h-24 mb-2 mix-blend-multiply"
                                />
                                <p className="text-xs font-semibold text-gray-900">Scan to Pay</p>
                                <p className="text-[10px] text-gray-500 break-all">{bill.shop.upi_id}</p>
                            </div>
                        )}
                        {!bill.shop?.upi_id && bill.shop?.qr_code_url && (
                            <div className="flex flex-col items-center md:items-start border p-4 rounded-lg bg-gray-50 max-w-[200px]">
                                <img src={bill.shop.qr_code_url} alt="Shop QR" className="w-24 h-24 mb-2" />
                                <p className="text-xs font-semibold text-gray-900">Scan to Pay</p>
                            </div>
                        )}
                    </div>

                    {/* Totals Summary */}
                    <div className="w-full md:w-1/2 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(bill.subtotal)}</span>
                        </div>
                        {bill.discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount:</span>
                                <span>-{formatCurrency(bill.discount)}</span>
                            </div>
                        )}
                        {bill.delivery_charge && bill.delivery_charge > 0 && (
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Delivery Charge:</span>
                                <span>{formatCurrency(bill.delivery_charge)}</span>
                            </div>
                        )}

                        <div className="border-t border-gray-200 my-2"></div>

                        <div className="flex justify-between items-center text-gray-900 font-bold">
                            <span className="text-base uppercase">Grand Total:</span>
                            <span className="text-xl">{formatCurrency(bill.total)}</span>
                        </div>

                        <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-600">Payment Status:</span>
                            <span className={`font-semibold uppercase ${(bill.payment_status || 'unpaid') === 'paid' ? 'text-green-600' :
                                (bill.payment_status || 'unpaid') === 'partial' ? 'text-blue-600' : 'text-red-500'
                                }`}>
                                {bill.payment_status || 'UNPAID'}
                            </span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Balance Due:</span>
                            <span className="font-bold text-red-500">
                                {formatCurrency(bill.total - (bill.paid_amount || 0))}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Message */}
                <div className="mt-16 text-center text-sm text-gray-500">
                    <p className="font-medium text-gray-900 mb-1">Thank you for your business!</p>
                    <p className="text-xs">Payment due within 30 days. Please make checks payable to {bill.shop?.name}.</p>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center gap-4 text-xs text-gray-400">
                        <span>www.vallaroo.com</span>
                        <span>|</span>
                        <span>contact@vallaroo.com</span>
                    </div>
                </div>

            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page { margin: 0; }
                    body { 
                        background: white; 
                        -webkit-print-color-adjust: exact; 
                    }
                    div[class*="min-h-screen"] {
                        padding: 0;
                    }
                    #invoice-content {
                        border: none;
                        box-shadow: none;
                        padding: 2cm;
                        max-width: 100%;
                    }
                     /* Hide URL/header/footer provided by browser */
                    /* Note: Browser settings override this usually, but good to try */
                }
            `}</style>
        </div>
    );
}
