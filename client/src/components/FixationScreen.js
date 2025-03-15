import React, { useEffect } from 'react';
import { FIXATION_DURATION } from '../config/invariants'; // Import duration from invariants.js
import './FixationScreen.css';

function FixationScreen({ onTimeout }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onTimeout();
    }, FIXATION_DURATION);

    return () => clearTimeout(timer);
  }, [onTimeout]);

  return (
    <div className="fixation-screen">
      <span className="plus-sign">+</span>
    </div>
  );
}

export default FixationScreen;
