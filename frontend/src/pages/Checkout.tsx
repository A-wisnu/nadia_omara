import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder } from '../api';
import { UserIcon, PhoneIcon, ChevronLeftIcon, TicketIcon } from '@heroicons/react/24/outline';

const Checkout: React.FC = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Default form data
    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });

    if (!state) {
        return <div className="min-h-screen flex items-center justify-center text-gray-400 font-bold uppercase">Invalid Session</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const order = await createOrder(state.eventId, state.ticketType, 1, formData);
            navigate(`/payment/${order.id}`);
        } catch (error: any) {
            alert(error.response?.data || "Gagal membuat order");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Header / Nav */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <button onClick={() => navigate(-1)} className="group flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                    <div className="p-2 bg-white border border-gray-200 rounded-full mr-3 group-hover:border-gray-400 transition-all shadow-sm">
                        <ChevronLeftIcon className="w-5 h-5" />
                    </div>
                    KEMBALI
                </button>
            </div>

            <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight">
                        Detail Pemesan
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Lengkapi data diri untuk menerima E-Ticket</p>
                </div>

                <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl border border-gray-100 overflow-hidden relative">

                    {/* Ticket Summary Card */}
                    <div className="bg-sky-50 rounded-2xl p-6 mb-8 border border-sky-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <TicketIcon className="w-24 h-24 text-primary" />
                        </div>
                        <h3 className="text-xs font-bold text-sky-500 uppercase tracking-widest mb-1">Items Included</h3>
                        <div className="flex justify-between items-end relative z-10">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{state.ticketType} TICKET</h2>
                                <p className="text-gray-600 font-medium mt-1">1x Tiket Masuk</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">TOTAL BAYAR</p>
                                <div className="text-3xl font-black text-black">
                                    Rp {Number(state.price / 1000).toFixed(0)}k
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Nama Lengkap</label>
                            <div className="relative group">
                                <UserIcon className="w-6 h-6 absolute left-4 top-3.5 text-gray-300 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Nama Sesuai KTP"
                                    className="w-full bg-gray-50 hover:bg-white border-2 border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-0 focus:border-primary focus:outline-none transition-all placeholder:text-gray-300 text-gray-900 font-bold text-lg"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">WhatsApp / Email</label>
                            <div className="relative group">
                                <PhoneIcon className="w-6 h-6 absolute left-4 top-3.5 text-gray-300 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    required
                                    placeholder="08xxxxxxxxxx"
                                    className="w-full bg-gray-50 hover:bg-white border-2 border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-0 focus:border-primary focus:outline-none transition-all placeholder:text-gray-300 text-gray-900 font-bold text-lg"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-2xl font-black text-xl shadow-lg shadow-gray-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3 uppercase tracking-wide"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </>
                                ) : 'Bayar Sekarang'}
                            </button>
                            <p className="text-xs text-center text-gray-400 mt-4 font-medium">
                                Data Anda aman dan hanya digunakan untuk verifikasi saat penukaran tiket.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
