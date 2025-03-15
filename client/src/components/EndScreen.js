import React from 'react';

function EndScreen({ score }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '20vh' }}>
      <h1>EXPERIMENT COMPLETED</h1>
      <h2>FINAL SCORE: {score}</h2>
    </div>
  );
}

export default EndScreen;
