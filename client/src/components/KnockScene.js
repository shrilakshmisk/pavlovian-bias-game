import React, { useEffect, useState, useRef } from 'react';
import './KnockScene.css';
import coinIcon from '../assets/coin.jpg'; // Make sure you have a coin icon here

function KnockScene({
  userId,
  backgroundImage,
  isKnockCorrect,  // true if knocking (pressing space) is the correct response (Go trial)
  score,
  onComplete       // callback to send result data to parent
}) {
  const [timeLeft, setTimeLeft] = useState(3000); // 3 seconds in ms
  const [pressed, setPressed] = useState(false);
  const intervalRef = useRef(null);

  // Start a 3-second countdown timer
  useEffect(() => {
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = 3000 - elapsed;
      setTimeLeft(remaining > 0 ? remaining : 0);
      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        finishScene(false); // no press
      }
    }, 10);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Listen for spacebar presses
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !pressed && timeLeft > 0) {
        setPressed(true);
        clearInterval(intervalRef.current);
        finishScene(true); // press detected
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pressed, timeLeft]);

  // Called when time runs out or when a key is pressed
  function finishScene(didPress) {
    // Calculate reaction time only if pressed; else keep it 0
    const reactionTime = didPress ? (3000 - timeLeft) : 0;
    // Determine correctness: on Go trials, a press is correct; on No-Go trials, a non-press is correct.
    const wasCorrect = (!isKnockCorrect && !didPress) || (isKnockCorrect && didPress);
    // Send both reaction time and correctness back to the parent.
    console.log('isKnockCorrect:', isKnockCorrect, 'didPress:', didPress, 'reactionTime:', reactionTime, 'wasCorrect:', wasCorrect);
    onComplete({ userKnocked: didPress, isCorrect: wasCorrect, reactionTime });
  }

  // Format timeLeft in seconds with two decimals
  const secondsLeft = (timeLeft / 1000).toFixed(2);

  return (
    <div
      className="knock-scene"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Score box at top right */}
       <div className="score-box">
       <img src={coinIcon} alt="COIN" className="coin-icon" />
       <span className="score-number">{score}</span>
       </div>
      <div className="timer-box">{secondsLeft}s</div>
      {/* Visual Knock button (only responds to spacebar) */}
      <button
        className="knock-button"
        onClick={(e) => e.preventDefault()}
      >
        KNOCK
      </button>
    </div>
  );
}

export default KnockScene;