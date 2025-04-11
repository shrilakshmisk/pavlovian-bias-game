import React, { useState, useEffect } from 'react';
import './BreakScreen.css';  // Adjust the path as needed

function BreakScreen({ duration = 180, onResume }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    // Update the countdown every second.
    const interval = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(interval);
          onResume(); // Automatically resume when timer reaches zero
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Listen for the Enter key to resume.
    const handleKeyDown = event => {
      if (event.key === 'Enter') {
        onResume();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup the interval and event listener on unmount.
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onResume]);

  // Format minutes and seconds.
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="break-screen">
      <h2>Take a short break!</h2>
      <div className="break-timer">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </div>
      <p className="break-instruction"><em>Press Enter to resume</em></p>
      {/* Resume button for visual purposes only */}
      <button className="resume-button" disabled>
        Resume
      </button>
    </div>
  );
}

export default BreakScreen;
