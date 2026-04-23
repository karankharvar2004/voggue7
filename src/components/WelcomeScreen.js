import React, { useState, useEffect } from 'react';

export default function WelcomeScreen() {
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setShow(true);
    // Give it slightly more time so the progress bar finishes and the user can see the aesthetic
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1500);

    // Completely remove from DOM
    const removeTimer = setTimeout(() => {
      setShow(false);
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`welcome-screen-overlay ${fadeOut ? 'fade-out' : 'fade-in'}`}>
      <div className="welcome-content">
        <img src="/BrandIcon.png" alt="Voggue7 Icon" className="welcome-logo" />
        <h1 className="welcome-brand-name">VOGGUE 7<span className="dot">.</span></h1>
        <p className="welcome-subtitle">
          BE YOUR OWN STANDARD
        </p>
      </div>

      <div className="welcome-loader">
        <div className="welcome-loader-bar"></div>
      </div>
    </div>
  );
}
