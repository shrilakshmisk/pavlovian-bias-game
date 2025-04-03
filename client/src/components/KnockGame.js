import React, { useState } from 'react';
import { useEffect } from 'react';
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
    for (let i = 0; i < count; i++) {
      block.push(trial);
    }
  });

  for (let i = block.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [block[i], block[j]] = [block[j], block[i]];
  }
  return block;
}

function generateTrialList() {
  let trialList = [];
  BLOCK_ORDER.forEach((conflictType) => {
    trialList = trialList.concat(generateBlock(conflictType));
  });
  return trialList;
}

function KnockGame({ userId }) {
  const [trialList] = useState(() => generateTrialList());
  const totalTrials = trialList.length;
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [phase, setPhase] = useState('fixation');
  const [trialKey, setTrialKey] = useState(1);
  const [score, setScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [scoreTransition, setScoreTransition] = useState('');
  const [experimentEnded, setExperimentEnded] = useState(false);

  const currentTrial = trialList[currentTrialIndex];

  const handleFixationTimeout = () => {
    setPhase('stimulus');
    setTrialKey(prev => prev + 1);
  };

    const handleKnockComplete = ({ userKnocked, isCorrect, reactionTime }) => {
    const trialType = currentTrial.type;
    let wasCorrect = false;
    let scoreChange = 0;

    if (trialType === 'go1') {
      if (userKnocked) {
        wasCorrect = Math.random() < 0.8;
        scoreChange = wasCorrect ? +50 : 0;
      } else {
        wasCorrect = Math.random() < 0.8;
        scoreChange = wasCorrect ? 0 : -50;
      }
    } else if (trialType === 'go2') {
      if (userKnocked) {
        wasCorrect = Math.random() < 0.8;
        scoreChange = wasCorrect ? 0 : +50;
      } else {
        wasCorrect = Math.random() < 0.8;
        scoreChange = wasCorrect ? -50 : 0;
      }
    } else if (trialType === 'nogo1') {
      if (userKnocked) {
        wasCorrect = Math.random() < 0.8;
        scoreChange = wasCorrect ? -50 : 0;
      } else {
        wasCorrect = Math.random() < 0.8;
        scoreChange = wasCorrect ? 0 : 50;
      }
    } else if (trialType === 'nogo2') {
      if (userKnocked) {
        wasCorrect = Math.random() < 0.8;
        scoreChange = wasCorrect ? 0 : -50;
      } else {
        wasCorrect = Math.random() < 0.8;
        scoreChange = wasCorrect ? +50 : 0;
      }
    }

    console.log(`Trial Type: ${trialType}, User Knocked: ${userKnocked}, wasCorrect: ${wasCorrect}, isCorrect: ${isCorrect}, Score Change: ${scoreChange}`);

    const oldScore = score;
    const newScore = oldScore + scoreChange;
    setScore(newScore);

    setFeedbackMessage(isCorrect ? `Correct! ${scoreChange}` : `Incorrect! ${scoreChange}`);
    setScoreTransition(`${oldScore} → ${newScore}`);

    const trialTypeMap = {
      go1: 1,
      go2: 2,
      nogo1: 3,
      nogo2: 4
    };
    
    const encodedTrialType = trialTypeMap[trialType] || 0; // fallback to 0 if undefined
    
    const trialData = {
      userId: userId,
      trialNumber: currentTrialIndex + 1,
      stimulus: encodedTrialType,
      reactionTime: reactionTime || 0,
      knocked: userKnocked,
      correct: isCorrect,
      scoreChange: scoreChange,
      newScore: newScore
    };
    saveTrialData(trialData);

    setPhase('feedback');

    setTimeout(() => {
      if (currentTrialIndex < totalTrials - 1) {
        setCurrentTrialIndex(prev => prev + 1);
        setPhase('fixation');
      } else {
        setExperimentEnded(true);
      }
    }, FEEDBACK_DURATION);
  };

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

  useEffect(() => {
    if (experimentEnded) {
      const surveyUrl = `https://qualtricsxmz5bxkymvf.au1.qualtrics.com/jfe/preview/previewId/12cb98cf-1505-4666-a335-9efd633e1b2b/SV_7R7AbLlr1DmRRt4?Q_CHL=preview&Q_SurveyVersionID=current`;

      const timer = setTimeout(() => {
        window.open(surveyUrl, "_blank");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [experimentEnded]);

  if (experimentEnded) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h2>Thank you for participating!</h2>
        <p>Your final score: <strong>{score}</strong></p>
        <p>You will be redirected to a short survey in <strong>5 seconds</strong>...</p>
        <p>
          If it doesn’t open,{' '}
          <a
            href="https://qualtricsxmz5bxkymvf.au1.qualtrics.com/jfe/preview/previewId/12cb98cf-1505-4666-a335-9efd633e1b2b/SV_7R7AbLlr1DmRRt4?Q_CHL=preview&Q_SurveyVersionID=current"
            target="_blank"
            rel="noreferrer"
          >
            click here
          </a>.
        </p>
      </div>
    );
  }
  
  return (
    <div style={{ position: 'relative' }}>
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

export default KnockGame;
