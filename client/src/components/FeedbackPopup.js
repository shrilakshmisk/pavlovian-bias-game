import React from 'react';
import './FeedbackPopup.css';
import backgroundImage from '../assets/background.jpeg'; // Adjust path as needed

function FeedbackPopup({ message, scoreTransition }) {
  const scoreClass = scoreTransition.includes("+") ? "score-positive" : "score-negative";

  return (
    <div 
      className="feedback-overlay" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="feedback-content">
        <h1>{message}</h1>
      </div>
    </div>
  );
}

export default FeedbackPopup;
