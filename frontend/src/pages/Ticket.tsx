import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import { getOrderDetail, getEvents } from '../api'; // Added getEvents to fetch event name detail if needed, or use order.eventId mapping
import type { Order } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { HomeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'; // New icons

const Ticket: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [eventName, setEventName] = useState<string>('Event Name'); // State for resolved event name

    // Helper to get Event Name (since Order only has EventID)
    useEffect(() => {
        if (!order) return;
        getEvents().then(events => {
            const ev = events.find(e => e.id === order.eventId);
            if (ev) setEventName(ev.name);
        }).catch(() => setEventName('Unknown Event'));
    }, [order]);

    useEffect(() => {
        if (!orderId) return;
        getOrderDetail(orderId).then(setOrder).catch(console.error);
    }, [orderId]);

    if (!order) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400 uppercase">Loading Ticket...</div>;

    if (order.status !== 'PAID') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50">
                <p className="text-red-500 font-black text-2xl uppercase mb-4">Tiket Tidak Valid</p>
                <p className="text-gray-500 font-medium mb-6">Pembayaran belum selesai atau tiket sudah kadaluarsa.</p>
                <button onClick={() => navigate('/')} className="px-6 py-2 bg-black text-white rounded-full font-bold uppercase text-xs">Kembali ke Home</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20 pt-10">
            <div className="max-w-md mx-auto px-4">

                {/* Success Message */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider mb-4 border border-green-200 shadow-sm">
                        <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                        Pembayaran Berhasil!
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">E-Ticket Anda</h1>
                    <p className="text-gray-500 mt-2 text-sm font-medium">Tunjukkan QR Code ini kepada petugas saat masuk.</p>
                </div>

                {/* Ticket Card */}
                <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-200 overflow-hidden relative transform transition-all hover:-translate-y-1 duration-500">

                    {/* Header (Black) */}
                    <div className="bg-black p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 relative z-10">EVENT EXCLUSIVE</p>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight relative z-10 leading-none">{eventName}</h2>
                    </div>

                    {/* QR Section */}
                    <div className="p-10 flex flex-col items-center justify-center relative bg-white">
                        {/* Holes visual */}
                        <div className="absolute -left-4 top-0 w-8 h-8 bg-gray-50 rounded-full"></div>
                        <div className="absolute -right-4 top-0 w-8 h-8 bg-gray-50 rounded-full"></div>
                        <div className="absolute top-0 left-8 right-8 border-t-2 border-dashed border-gray-200"></div>

                        <div className="p-4 bg-white border-4 border-black rounded-3xl shadow-lg mb-6">
                            {order.qrCode ? (
                                <QRCodeSVG value={order.qrCode} size={180} fgColor="#000000" />
                            ) : (
                                <div className="w-48 h-48 bg-gray-100 animate-pulse rounded-xl"></div>
                            )}
                        </div>

                        <div className="text-center space-y-1 w-full border-b border-gray-100 pb-6 mb-6">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">KODE BOOKING</p>
                            <p className="text-xl font-black text-gray-900 font-mono tracking-wider">{order.id.split('-')[1]}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 w-full text-center">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">TIKET</p>
                                <p className="text-lg font-black text-black uppercase">{order.ticketType}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">NAMA</p>
                                <p className="text-lg font-black text-black capitalize truncate">{order.user.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Cutoff */}
                    <div className="bg-gray-50 p-4 text-center border-t border-gray-200 flex flex-col items-center justify-center gap-1">
                        <p className="text-[10px] text-gray-400 font-mono uppercase">ID: {order.id}</p>
                        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wide">POWERED BY BARU TIX</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                    <button
                        onClick={() => window.print()}
                        className="w-full bg-black hover:bg-gray-800 text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-wide shadow-lg shadow-gray-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Simpan Tiket
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-900 py-3.5 rounded-xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-colors active:scale-95"
                    >
                        <HomeIcon className="w-5 h-5" />
                        Kembali ke Home
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Ticket;
