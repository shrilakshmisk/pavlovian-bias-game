import React from 'react';

function FeedbackScene({ wasCorrect, onNext }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h1>{wasCorrect ? 'Points:' : 'Points:'}</h1>
      <button onClick={onNext}>NEXT</button>
    </div>
  );
}

export default FeedbackScene;
