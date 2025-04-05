import React, { useState, useEffect } from 'react';
import Instructions from './components/Instructions';
import UserEntryScreen from './components/UserEntryScreen';
import StartScene from './components/StartScene';
import KnockGame from './components/KnockGame';
import PreloadImages from './PreloadImages';

function App() {
  const [currentScene, setCurrentScene] = useState('instructions'); // Start with instructions
  const [userId, setUserId] = useState('');

  // Called when the user closes the instructions page
  function handleInstructionsClose() {
    setCurrentScene('userEntry'); // Move to user entry screen
  }

  // Called when the user submits their username
  function handleUserSubmit(username) {
    console.log("Username submitted:", username);
    localStorage.setItem("userId", username);

    setUserId(username);
    setCurrentScene('start'); // After user entry, show start scene
  }

  // Called when user presses space or "start" on the StartScene
  function handleStart() {
    setCurrentScene('knockGame');
  }

  useEffect(() => {
    if (!userId) {
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) {
        console.log("Retrieved userId from localStorage:", storedUserId);
        setUserId(storedUserId);
      }
    }
  }, [userId]);

  return (
    <div>
      <PreloadImages />
      {currentScene === 'instructions' && <Instructions onClose={handleInstructionsClose} />}
      {currentScene === 'userEntry' && <UserEntryScreen onSubmit={handleUserSubmit} />}
      {currentScene === 'start' && <StartScene onStart={handleStart} />}
      {currentScene === 'knockGame' && <KnockGame userId={userId} />}
    </div>
  );
}

export default App;
