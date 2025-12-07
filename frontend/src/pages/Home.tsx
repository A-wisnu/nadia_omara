import React, { useEffect, useState } from 'react';
import { getEvents } from '../api';
import type { Event } from '../types';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

const Home: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [currentBanner, setCurrentBanner] = useState(0);

    // Mock Banner Data - Using Local Images
    const banners = [
        { id: 1, image: '/banners/banner1.jpg', title: 'Senja Fest 2024' },
        { id: 2, image: '/banners/banner2.jpg', title: 'Indie Movie Night' },
        { id: 3, image: '/banners/banner1.jpg', title: 'Music Concert' }
    ];

    // Map Event IDs to Images (Robust Linkage)
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
        getEvents().then(setEvents).catch(console.error);

        const interval = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const scrollToSection = (direction: 'left' | 'right', elementId: string) => {
        const container = document.getElementById(elementId);
        if (container) {
            const scrollAmount = direction === 'left' ? -350 : 350;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-white min-h-screen font-sans">

            {/* --- HERO BANNER --- */}
            <div className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden group">
                {banners.map((banner, index) => (
                    <div
                        key={banner.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8 md:p-16">
                            <h2 className="text-white text-4xl md:text-6xl font-black tracking-tight uppercase drop-shadow-lg">
                                {banner.title}
                            </h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- SECTION 1: SEDANG BERLANGSUNG (ID-Based Poster Mapping) --- */}
            <section id="now" className="py-12 md:py-20 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                        SEDANG BERLANGSUNG
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={() => scrollToSection('left', 'scroll-now')} className="p-2 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors">
                            <ChevronLeftIcon className="w-5 h-5 text-gray-900" />
                        </button>
                        <button onClick={() => scrollToSection('right', 'scroll-now')} className="p-2 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors">
                            <ChevronRightIcon className="w-5 h-5 text-gray-900" />
                        </button>
                    </div>
                </div>

                <div
                    id="scroll-now"
                    className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {/* We used to slice(0,3), but now we can show "Featured" events. 
                        For now, let's keep showing the first 3 events from the API (which is now sorted safely).
                        Alternatively, we could filter IDs 'ev1','ev2','ev3'. */}
                    {events.slice(0, 3).map((event) => (
                        <div key={event.id} className="min-w-[85vw] md:min-w-[400px] snap-center">
                            <Link to={`/event/${event.id}`} className="block group relative rounded-3xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] h-[550px]">
                                <img
                                    src={getEventImage(event.id)}
                                    alt={event.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = 'https://via.placeholder.com/400x600/4f46e5/ffffff?text=' + encodeURIComponent(event.name);
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- SECTION 2: EVENT (ID-Based Event Mapping) --- */}
            <section id="events" className="py-12 md:py-20 bg-sky-600 text-white">
                <div className="px-4 md:px-8 max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight uppercase">EVENT</h2>
                            <p className="text-sky-100 mt-2 font-medium tracking-wide">TEMUKAN KESERUAN LAINNYA</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => scrollToSection('left', 'scroll-events')} className="p-2 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm">
                                <ChevronLeftIcon className="w-5 h-5 text-white" />
                            </button>
                            <button onClick={() => scrollToSection('right', 'scroll-events')} className="p-2 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm">
                                <ChevronRightIcon className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    <div
                        id="scroll-events"
                        className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {events.map((event) => (
                            <Link to={`/event/${event.id}`} key={event.id} className="min-w-[280px] md:min-w-[320px] snap-start group transition-all duration-300 transform hover:-translate-y-1">
                                <div className="h-48 rounded-2xl overflow-hidden relative shadow-lg">
                                    <img
                                        src={getEventImage(event.id)}
                                        alt={event.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = 'https://via.placeholder.com/400x300/0ea5e9/ffffff?text=' + encodeURIComponent(event.name);
                                        }}
                                    />
                                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-black text-white uppercase tracking-wider shadow-sm border border-white/20">
                                        {event.date.split(',')[0]}
                                    </div>
                                </div>
                                <div className="pt-4 px-1">
                                    <h3 className="font-black text-xl text-white mb-1 uppercase tracking-tight line-clamp-1 group-hover:text-sky-200 transition-colors">{event.name}</h3>
                                    <p className="text-sm text-sky-100 mb-4 line-clamp-1 font-medium opacity-80">{event.location}</p>
                                    <div className="flex items-center justify-between border-t border-sky-500/30 pt-4">
                                        <span className="text-xs text-sky-200 font-bold uppercase tracking-wider">MULAI DARI</span>
                                        <span className="text-white font-black text-xl">
                                            Rp {Number(event.tickets['Regular'].price / 1000).toFixed(0)}k
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
