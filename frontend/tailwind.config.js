/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'], // Enforce Sans
            },
            colors: {
                primary: '#4f46e5',
                secondary: '#db2777',
                background: '#f8fafc',
                surface: '#ffffff',
                text: '#0f172a',
                // Note: 'sky' is included in Tailwind v3 default theme colors
            }
        },
    },
    plugins: [],
}
