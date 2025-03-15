import React, { useEffect } from 'react';
import './AdditionProblemScreen.css';

function AdditionProblemScreen({ problem, onTimeout, duration }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onTimeout();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onTimeout]);

  return (
    <div className="addition-problem-screen">
      <h1>{problem}</h1>
    </div>
  );
}

export default AdditionProblemScreen;
