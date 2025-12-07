import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import SplashScreen from './SplashScreen'; // Import

const Layout: React.FC = () => {
    const location = useLocation();
    const [showSplash, setShowSplash] = useState(true);

    // Hide splash after it finishes
    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    // Hide menu explicitly on Detail and Checkout pages

    // Hide menu explicitly on Detail and Checkout pages
    // Check if path is exactly "/" (Home) to show menu, or if we want to support other pages later.
    // Requirement: Hide on Detail and Checkout.
    const isHome = location.pathname === '/';

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            {/* Splash Screen - Show only if state is true */}
            {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

            {/* Navbar - Centered & Larger */}
            <header className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300 ${showSplash ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="max-w-7xl mx-auto px-4 h-24 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 relative">

                    {/* Logo - Centered & Bigger */}
                    <Link to="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="Senja Fest Logo" className="h-16 md:h-20 w-auto object-contain" />
                    </Link>

                    {/* Desktop Menu - Centered, Uppercase, Bold Sans - ONLY ON HOME */}
                    {isHome && (
                        <nav className="hidden md:flex items-center gap-10">
                            <a href="#now" className="text-gray-800 hover:text-primary font-black text-sm uppercase tracking-widest transition-colors">
                                SEKARANG
                            </a>
                            <a href="#events" className="text-gray-800 hover:text-primary font-black text-sm uppercase tracking-widest transition-colors">
                                EVENT
                            </a>
                        </nav>
                    )}

                    {/* Mobile Menu Button (Absolute Right) - ONLY ON HOME */}
                    {isHome && (
                        <button className="md:hidden absolute right-4 top-8 p-2 text-gray-800">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-28 md:pt-24">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
