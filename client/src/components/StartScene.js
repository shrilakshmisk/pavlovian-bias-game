import React, { useEffect } from 'react';
import './StartScene.css';
import coinIcon from '../assets/coin.jpg'; // Make sure you have a coin icon here

function StartScene({ score = 0, onStart }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onStart]);

  return (
    <div className="start-scene">
      {/* Background Overlay (Ensures only background is semi-transparent) */}
      <div className="background-overlay"></div>

      {/* Score Box at Top Right */}
      <div className="score-box">
        <img src={coinIcon} alt="COIN" className="coin-icon" />
        <span className="score-number">{score}</span>
      </div>

      {/* Start Button (Only for display, does nothing on click) */}
      <button
        className="start-button"
        onClick={(e) => e.preventDefault()} // Prevents mouse click usage
      >
        START
      </button>

      {/* Instruction Text */}
      <p className="instruction-text">PRESS SPACEBAR TO START</p>
    </div>
  );
}

export default StartScene;
