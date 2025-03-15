import React from 'react';
import './FeedbackPopup.css';

function FeedbackPopup({ message, scoreTransition }) {
  return (
    <div className="feedback-overlay">
      <div className="feedback-content">
        <h1>{message}</h1>
        <h2>{scoreTransition}</h2>
      </div>
    </div>
  );
}

export default FeedbackPopup;
