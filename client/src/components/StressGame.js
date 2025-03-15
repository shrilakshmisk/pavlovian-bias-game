import React, { useState } from 'react';
import KnockScene from './KnockScene';
import FixationScreen from './FixationScreen';
import AdditionProblemScreen from './AdditionProblemScreen';
import AnswerInputScreen from './AnswerInputScreen';
import EndScreen from './EndScreen';
import {
  ADDITION_DURATION,
  FIXATION_DURATION,
  ASSET_PATHS,
  BLOCK_ORDER_STRESS,
  BLOCK_PROPORTIONS_STRESS
} from '../config/invariants';

// Helper to generate a block for stress game (LCS or HCS)
function generateStressBlock(blockType) {
  let block = [];
  const proportions = BLOCK_PROPORTIONS_STRESS[blockType];
  if (blockType === "LCS") {
    for (let i = 0; i < proportions.go1; i++) {
      block.push({ type: 'go1', img: ASSET_PATHS.goImage1, isKnockCorrect: true, block: 'LCS' });
    }
    for (let i = 0; i < proportions.go2; i++) {
      block.push({ type: 'go2', img: ASSET_PATHS.goImage2, isKnockCorrect: true, block: 'LCS' });
    }
    for (let i = 0; i < proportions.nogo1; i++) {
      block.push({ type: 'nogo1', img: ASSET_PATHS.nogoImage1, isKnockCorrect: false, block: 'LCS' });
    }
    for (let i = 0; i < proportions.nogo2; i++) {
      block.push({ type: 'nogo2', img: ASSET_PATHS.nogoImage2, isKnockCorrect: false, block: 'LCS' });
    }
  } else if (blockType === "HCS") {
    for (let i = 0; i < proportions.go1; i++) {
      block.push({ type: 'go1', img: ASSET_PATHS.goImage1, isKnockCorrect: true, block: 'HCS' });
    }
    for (let i = 0; i < proportions.go2; i++) {
      block.push({ type: 'go2', img: ASSET_PATHS.goImage2, isKnockCorrect: true, block: 'HCS' });
    }
    for (let i = 0; i < proportions.nogo1; i++) {
      block.push({ type: 'nogo1', img: ASSET_PATHS.nogoImage1, isKnockCorrect: false, block: 'HCS' });
    }
    for (let i = 0; i < proportions.nogo2; i++) {
      block.push({ type: 'nogo2', img: ASSET_PATHS.nogoImage2, isKnockCorrect: false, block: 'HCS' });
    }
  }
  // Shuffle the block
  for (let i = block.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [block[i], block[j]] = [block[j], block[i]];
  }
  return block;
}

// Generate complete trial list for stress game: two blocks (LCS and HCS)
function generateStressTrialList() {
  let trialList = [];
  trialList = trialList.concat(generateStressBlock("LCS"));
  trialList = trialList.concat(generateStressBlock("HCS"));
  return trialList;
}

// Helper to generate a random addition problem
function generateAdditionProblem() {
  // Example: first number between 10-20, second between 1-9
  const num1 = Math.floor(Math.random() * 11) + 10;
  const num2 = Math.floor(Math.random() * 9) + 1;
  return { problem: `${num1} + ${num2}`, answer: num1 + num2 };
}

function StressGame({ userId }) {
  const [trialList] = useState(() => generateStressTrialList());
  const totalTrials = trialList.length; // 40 trials total
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  // Phases: 'addition' → 'fixation' → 'stimulus' → 'answer'
  const [phase, setPhase] = useState('addition');
  const [trialKey, setTrialKey] = useState(1); // to force remount of KnockScene
  const [score, setScore] = useState(0);
  // Addition problem for current trial
  const [additionProblem, setAdditionProblem] = useState(generateAdditionProblem());
  // Store knock data from KnockScene
  const [knockData, setKnockData] = useState(null);
  const [experimentEnded, setExperimentEnded] = useState(false);

  const currentTrial = trialList[currentTrialIndex];

  // Phase transitions:
  // Phase "addition": Show addition problem for ADDITION_DURATION, then move to fixation.
  const handleAdditionTimeout = () => {
    setPhase('fixation');
    setTrialKey(prev => prev + 1);
  };

  // Phase "fixation": After FIXATION_DURATION, move to stimulus.
  const handleFixationTimeout = () => {
    setPhase('stimulus');
  };

  // Phase "stimulus": When KnockScene finishes, record knock data and move to answer phase.
  const handleKnockComplete = ({ wasCorrect, reactionTime }) => {
    const oldScore = score;
    const delta = wasCorrect ? 50 : -50;
    const newScore = oldScore + delta;
    setScore(newScore);
    setKnockData({ wasCorrect, reactionTime, delta, newScore });
    setPhase('answer');
  };

  // Phase "answer": When participant submits their answer, record addition data and move on.
  const handleAnswerSubmit = (typedAnswer) => {
    const additionCorrect = parseInt(typedAnswer, 10) === additionProblem.answer;
    // Build trial data including knock and addition info.
    const trialData = {
      trialNumber: currentTrialIndex + 1,
      block: currentTrial.block,
      stimulus: currentTrial.type,
      knockReactionTime: knockData ? knockData.reactionTime : 0,
      knockCorrect: knockData ? knockData.wasCorrect : false,
      scoreChange: knockData ? knockData.delta : 0,
      newScore: knockData ? knockData.newScore : score,
      additionProblem: additionProblem.problem,
      correctAdditionAnswer: additionProblem.answer,
      typedAdditionAnswer: typedAnswer,
      additionCorrect: additionCorrect,
    };
    saveTrialData(trialData);

    // Move to next trial
    if (currentTrialIndex < totalTrials - 1) {
      setCurrentTrialIndex(prev => prev + 1);
      setAdditionProblem(generateAdditionProblem());
      setPhase('addition');
    } else {
      setExperimentEnded(true);
    }
  };

  // Function to send trial data to backend
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
      {phase === 'addition' && (
        <AdditionProblemScreen
          problem={additionProblem.problem}
          duration={ADDITION_DURATION}
          onTimeout={handleAdditionTimeout}
        />
      )}
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
      {phase === 'answer' && (
        <AnswerInputScreen onSubmit={handleAnswerSubmit} />
      )}
    </div>
  );
}

export default StressGame;
