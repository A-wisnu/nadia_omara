import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrderDetail, payOrder } from '../api';
import type { Order } from '../types';
import { QrCodeIcon, ClockIcon, ChevronLeftIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

const Payment: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!orderId) return;
        getOrderDetail(orderId).then(setOrder).catch(() => navigate('/'));
    }, [orderId, navigate]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handlePay = async () => {
        if (!orderId) return;
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1500));
            await payOrder(orderId);
            navigate(`/ticket/${orderId}`);
        } catch (error) {
            alert("Gagal memproses pembayaran");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (!order) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500 uppercase">Loading Session...</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <button onClick={() => navigate(-1)} className="group flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                    <div className="p-2 bg-white border border-gray-200 rounded-full mr-3 group-hover:border-gray-400 transition-all shadow-sm">
                        <ChevronLeftIcon className="w-5 h-5" />
                    </div>
                    BATALKAN
                </button>
            </div>

            <div className="max-w-xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Pembayaran</h1>
                    <p className="text-gray-500 mt-2 font-medium">Selesaikan pembayaran sebelum waktu habis</p>

                    <div className={`mt-6 inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider
                        ${timeLeft < 60 ? 'bg-red-50 text-red-500 animate-pulse border border-red-100' : 'bg-black text-white shadow-lg shadow-black/20'}
                    `}>
                        <ClockIcon className="w-5 h-5" />
                        <span>Sisa Waktu: {formatTime(timeLeft)}</span>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-gray-100 overflow-hidden relative">

                    <div className="text-center border-b border-gray-100 pb-8 mb-8">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Total Tagihan</p>
                        <div className="text-5xl font-black text-gray-900 tracking-tight">
                            Rp {Number(order.totalAmount / 1000).toFixed(0)}k
                        </div>
                        <div className="mt-4 inline-block bg-sky-50 px-4 py-1.5 rounded-lg border border-sky-100">
                            <p className="text-xs font-bold text-sky-600 uppercase tracking-wide">
                                {order.ticketType} Ticket (x{order.quantity})
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center group hover:border-black hover:bg-white transition-all duration-300">
                            <QrCodeIcon className="w-16 h-16 text-gray-800 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                            <p className="font-bold text-gray-900 uppercase text-sm mb-1">Scan QRIS</p>
                            <p className="text-xs text-gray-500 font-medium">Scan menggunakan GoPay, OVO, Dana, dll</p>
                        </div>

                        <div className="text-center space-y-3">
                            <button
                                onClick={handlePay}
                                disabled={loading || timeLeft === 0}
                                className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-2xl font-black text-xl shadow-xl shadow-gray-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 uppercase tracking-wide"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifikasi Bayar
                                    </>
                                ) : (
                                    <>
                                        <CheckBadgeIcon className="w-6 h-6" />
                                        Konfirmasi Bayar
                                    </>
                                )}
                            </button>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                                *Simulasi Pembayaran Instan
                            </p>
                        </div>
                    </div>

                    {timeLeft === 0 && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-20">
                            <div className="text-center">
                                <p className="text-red-500 text-xl font-black uppercase mb-4">Waktu Habis</p>
                                <button onClick={() => navigate('/')} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold uppercase text-sm hover:bg-black transition-colors">
                                    Kembali ke Home
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Payment;
