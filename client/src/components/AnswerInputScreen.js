import React, { useState } from 'react';
import './AnswerInputScreen.css';

function AnswerInputScreen({ onSubmit }) {
  const [answer, setAnswer] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(answer);
    setAnswer('');
  };

  return (
    <div className="answer-input-screen">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer..."
          className="answer-input"
          autoFocus
        />
      </form>
    </div>
  );
}

export default AnswerInputScreen;
