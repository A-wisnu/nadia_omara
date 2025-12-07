import React, { useEffect, useState, useRef } from 'react';

const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    // Stage: 'start' -> 'credits-in' -> 'credits-out' -> 'logo-in' -> 'logo-out' -> 'final-fade' -> 'done'
    const [stage, setStage] = useState('start');

    const credits = [
        "Ahmad Surya Bimantara (231240001384)",
        "Wisnu hidayat (231240001422)",
        "M Iqbal Maulana (231240001355)",
        "Najwa Khoirun Nisa'i S (231240001449)",
        "Alysiya Ramadhani (231240001453)"
    ];

    const onFinishRef = useRef(onFinish);

    // Keep ref updated
    useEffect(() => {
        onFinishRef.current = onFinish;
    }, [onFinish]);

    useEffect(() => {
        // Preload Logo
        const img = new Image();
        img.src = "/logo.png";

        // Timeline Sequence
        // 0ms: Start (White Screen)
        const t1 = setTimeout(() => setStage('credits-in'), 100);

        // 3000ms: Fade Out Credits
        const t2 = setTimeout(() => setStage('credits-out'), 3000);

        // 4000ms: Fade In Logo (Wait 1s for credits to fully disappear)
        const t3 = setTimeout(() => setStage('logo-in'), 4000);

        // 7000ms: Fade Out Logo
        const t4 = setTimeout(() => setStage('logo-out'), 7000);

        // 8000ms: Fade Out Background (Reveal App)
        const t5 = setTimeout(() => setStage('final-fade'), 8000);

        // 9000ms: Remove Component
        const t6 = setTimeout(() => {
            setStage('done');
            if (onFinishRef.current) onFinishRef.current();
        }, 9000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            clearTimeout(t5);
            clearTimeout(t6);
        };
    }, []); // Empty dependency array ensures this runs strict once on mount

    if (stage === 'done') return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] bg-white flex items-center justify-center transition-opacity duration-1000 ease-in-out
                ${stage === 'final-fade' ? 'opacity-0' : 'opacity-100'}
            `}
        >
            <div className="relative w-full h-full flex items-center justify-center">

                {/* CREDITS SECTION */}
                <div
                    className={`absolute inset-0 flex flex-col items-center justify-center text-center px-4 transition-all duration-1000 ease-in-out transform
                        ${(stage === 'start' || stage === 'credits-out' || stage === 'logo-in' || stage === 'logo-out' || stage === 'final-fade')
                            ? 'opacity-0 scale-95'
                            : 'opacity-100 scale-100'}
                    `}
                >
                    <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs mb-8">Created By</p>
                    <div className="space-y-3">
                        {credits.map((name, i) => (
                            <p key={i} className="text-gray-900 font-black text-lg md:text-2xl font-mono tracking-tight leading-relaxed">
                                {name}
                            </p>
                        ))}
                    </div>
                </div>

                {/* LOGO SECTION */}
                <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-in-out transform
                        ${(stage === 'logo-in') ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}
                    `}
                >
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="w-[80vw] md:w-[600px] h-auto object-contain drop-shadow-2xl"
                    />
                </div>

            </div>
        </div>
    );
};

export default SplashScreen;
