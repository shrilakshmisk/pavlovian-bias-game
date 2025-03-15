// KnockGame.js
import React, { useState } from 'react';
import KnockScene from './KnockScene';
import FeedbackPopup from './FeedbackPopup';
import FixationScreen from './FixationScreen';
import EndScreen from './EndScreen';
import {
  FIXATION_DURATION,
  FEEDBACK_DURATION,
  TOTAL_TRIALS_PER_BLOCK,
  BLOCK_ORDER,
  BLOCK_PROPORTIONS,
  ASSET_PATHS
} from '../config/invariants';

// Helper: generate a block of trials for a given conflict type
function generateBlock(conflictType) {
  const proportions = BLOCK_PROPORTIONS[conflictType];
  let block = [];

  Object.keys(proportions).forEach((trialType) => {
    const count = proportions[trialType];
    let trial;
    if (trialType === 'go1') {
      trial = { type: trialType, img: ASSET_PATHS.goImage1, isKnockCorrect: true };
    } else if (trialType === 'go2') {
      trial = { type: trialType, img: ASSET_PATHS.goImage2, isKnockCorrect: true };
    } else if (trialType === 'nogo1') {
      trial = { type: trialType, img: ASSET_PATHS.nogoImage1, isKnockCorrect: false };
    } else if (trialType === 'nogo2') {
      trial = { type: trialType, img: ASSET_PATHS.nogoImage2, isKnockCorrect: false };
    }
    // Push the trial object count times
    for (let i = 0; i < count; i++) {
      block.push(trial);
    }
  });

  // Shuffle the block using Fisher–Yates algorithm
  for (let i = block.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [block[i], block[j]] = [block[j], block[i]];
  }
  return block;
}

// Generate the complete trial list by concatenating blocks in the specified order
function generateTrialList() {
  let trialList = [];
  BLOCK_ORDER.forEach((conflictType) => {
    trialList = trialList.concat(generateBlock(conflictType));
  });
  return trialList;
}

function KnockGame({ userId }) {
  // Generate trial list only once
  const [trialList] = useState(() => generateTrialList());
  const totalTrials = trialList.length; // should be 80
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [phase, setPhase] = useState('fixation'); // 'fixation', 'stimulus', 'feedback'
  const [trialKey, setTrialKey] = useState(1); // to force remount of KnockScene each trial
  const [score, setScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [scoreTransition, setScoreTransition] = useState('');
  const [experimentEnded, setExperimentEnded] = useState(false);

  const currentTrial = trialList[currentTrialIndex];

  // When the fixation phase times out (after FIXATION_DURATION), move to the stimulus phase
  const handleFixationTimeout = () => {
    setPhase('stimulus');
    setTrialKey(prev => prev + 1); // force fresh KnockScene
  };

  // When the stimulus phase ends (via spacebar press or timeout), handle feedback
  const handleKnockComplete = ({ wasCorrect, reactionTime }) => {
    const oldScore = score;
    const delta = wasCorrect ? 50 : -50;
    const newScore = oldScore + delta;
    setScore(newScore);

    setFeedbackMessage(wasCorrect ? 'HURRAY!!! +50' : 'BAD LUCK!!! -50');
    setScoreTransition(`${oldScore} → ${newScore}`);

    // Build trial data
    const trialData = {
      trialNumber: currentTrialIndex + 1,
      stimulus: currentTrial.type,
      reactionTime: reactionTime, // 0 if no press
      correct: wasCorrect,
      scoreChange: delta,
      newScore: newScore
    };
    saveTrialData(trialData);

    // Move to feedback phase
    setPhase('feedback');

    // After FEEDBACK_DURATION, go to next trial or end experiment
    setTimeout(() => {
      if (currentTrialIndex < totalTrials - 1) {
        setCurrentTrialIndex(prev => prev + 1);
        setPhase('fixation');
      } else {
        setExperimentEnded(true);
      }
    }, FEEDBACK_DURATION);
  };

  // Function to send trial data to the backend
  function saveTrialData(trialData) {
    fetch('/api/trialData', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trialData),
    })
      .then(res => res.json())
      .then(data => console.log('Trial data saved:', data))
      .catch(err => console.error('Error saving trial data:', err));
  }

  if (experimentEnded) {
    return <EndScreen score={score} />;
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Phase control: */}
      {phase === 'fixation' && (
        <FixationScreen onTimeout={handleFixationTimeout} duration={FIXATION_DURATION} />
      )}
      {phase === 'stimulus' && (
        <KnockScene
          key={trialKey}
          userId={userId}
          backgroundImage={currentTrial.img}
          isKnockCorrect={currentTrial.isKnockCorrect}
          score={score}
          onComplete={handleKnockComplete}
        />
      )}
      {phase === 'feedback' && (
        <FeedbackPopup
          message={feedbackMessage}
          scoreTransition={scoreTransition}
        />
      )}
    </div>
  );
}

// Example server update function (optional)
async function updateScoreOnServer(userId, newScore) {
  try {
    await fetch('/api/updateScore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, score: newScore }),
    });
  } catch (error) {
    console.error('Failed to update score on server:', error);
  }
}

export default KnockGame;
