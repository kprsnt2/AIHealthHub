import { useState, useEffect } from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
    onComplete: () => void;
    minDisplayTime?: number;
}

export default function SplashScreen({ onComplete, minDisplayTime = 2000 }: SplashScreenProps) {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true);
            // Allow fade animation to complete before calling onComplete
            setTimeout(onComplete, 500);
        }, minDisplayTime);

        return () => clearTimeout(timer);
    }, [onComplete, minDisplayTime]);

    return (
        <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`} role="status" aria-label="Loading application">
            <div className="splash-content">
                {/* Logo */}
                <div className="splash-logo">
                    <img src="/logo.png" alt="AI Health Hub Logo" className="logo-image" />
                </div>

                {/* App Name */}
                <h1 className="splash-title">AI Health Hub</h1>
                <p className="splash-tagline">Your Intelligent Health Companion</p>

                {/* Loading Animation */}
                <div className="splash-loader">
                    <div className="loader-bar">
                        <div className="loader-progress"></div>
                    </div>
                    <span className="loader-text">Initializing...</span>
                </div>

                {/* Feature Pills */}
                <div className="splash-features">
                    <span className="feature-pill">🩺 Symptom Analysis</span>
                    <span className="feature-pill">💊 Drug Information</span>
                    <span className="feature-pill">🥗 Diet Guidance</span>
                </div>
            </div>

            {/* Background Effects */}
            <div className="splash-orbs" aria-hidden="true">
                <div className="splash-orb orb-emerald"></div>
                <div className="splash-orb orb-cyan"></div>
                <div className="splash-orb orb-purple"></div>
            </div>
        </div>
    );
}
