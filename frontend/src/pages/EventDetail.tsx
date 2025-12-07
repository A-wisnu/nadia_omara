import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEvents } from '../api';
import type { Event, TicketStock } from '../types';
import { ChevronLeftIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';

const EventDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const navigate = useNavigate();

    // Map Event IDs to Images (Same as Home.tsx logic)
    const eventImages: Record<string, string> = {
        'ev1': '/posters/poster1.jpg',
        'ev2': '/posters/poster2.jpg',
        'ev3': '/posters/poster3.jpg',
        'ev4': '/events/event1.jpg',
        'ev5': '/events/event2.jpg'
    };

    const getEventImage = (eventId: string) => {
        return eventImages[eventId] || `https://source.unsplash.com/random/800x600?festival&sig=${eventId}`;
    };

    useEffect(() => {
        getEvents().then(events => {
            const found = events.find(e => e.id === id);
            setEvent(found || null);
        }).catch(console.error);
    }, [id]);

    const handleSelectTicket = (type: string, price: number) => {
        navigate('/checkout', { state: { eventId: id, ticketType: type, price } });
    };

    if (!event) return <div className="text-center p-8 text-gray-500 font-sans">Loading...</div>;

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

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-gray-100 overflow-hidden">
                    <div className="md:flex md:gap-12 md:items-start">

                        {/* LEFT: Poster Image */}
                        <div className="md:w-5/12 relative group">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-gray-100 relative">
                                <img
                                    src={getEventImage(event.id)}
                                    alt={event.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = 'https://via.placeholder.com/600x800/4f46e5/ffffff?text=' + encodeURIComponent(event.name);
                                    }}
                                />
                                {/* Glossy Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* RIGHT: Details & Tickets */}
                        <div className="md:w-7/12 mt-8 md:mt-0 space-y-8">

                            {/* Title Section */}
                            <div>
                                <h1 className="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-tight leading-tight mb-4">
                                    {event.name}
                                </h1>
                                <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500 uppercase tracking-wide">
                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                        <CalendarIcon className="w-5 h-5 text-primary" />
                                        <span>{event.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                        <MapPinIcon className="w-5 h-5 text-secondary" />
                                        <span>{event.location}</span>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-black text-gray-900 uppercase mb-3">Deskripsi Event</h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {event.description}
                                </p>
                            </div>

                            {/* Tickets Section */}
                            <div className="bg-sky-50/50 p-6 rounded-3xl border border-sky-100">
                                <h3 className="text-lg font-black text-gray-900 uppercase mb-5 flex items-center gap-3">
                                    <span className="w-3 h-8 bg-primary rounded-full"></span>
                                    Pilih Tiket
                                </h3>
                                <div className="grid gap-4">
                                    {Object.entries(event.tickets).map(([type, stock]: [string, TicketStock]) => (
                                        <div key={type}
                                            onClick={() => stock.available > 0 && handleSelectTicket(type, stock.price)}
                                            className={`
                                            relative bg-white border-2 rounded-2xl p-6 flex justify-between items-center transition-all duration-300
                                            ${stock.available === 0
                                                    ? 'border-gray-100 opacity-60 grayscale cursor-not-allowed'
                                                    : 'border-transparent shadow-md hover:shadow-xl hover:border-primary cursor-pointer hover:-translate-y-1'}
                                        `}>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-black text-2xl text-gray-900 uppercase italic tracking-tighter">{type}</h4>
                                                    {stock.available < 10 && stock.available > 0 && (
                                                        <span className="text-[10px] font-bold px-2 py-1 bg-red-100 text-red-600 rounded-md uppercase tracking-wide">
                                                            Segera Habis
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-500 font-medium">Stok Tersedia: <span className="text-gray-900 font-bold">{stock.available}</span></p>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-2xl font-black text-black">
                                                    Rp {Number(stock.price / 1000).toFixed(0)}k
                                                </div>
                                                {stock.available === 0 && (
                                                    <span className="text-xs text-red-500 font-bold uppercase mt-1 block">Sold Out</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
