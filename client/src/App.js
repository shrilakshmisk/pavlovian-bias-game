import React, { useState, useEffect  } from 'react';
import UserEntryScreen from './components/UserEntryScreen';
import StartScene from './components/StartScene';
import KnockGame from './components/KnockGame';

function App() {
  const [currentScene, setCurrentScene] = useState('userEntry');
  const [userId, setUserId] = useState('');

  // useEffect(() => {
  //   console.log("Updated userId:", userId);
  // }, [userId]);

  // Called when the user submits their username
  function handleUserSubmit(username) {
    console.log("Username submitted:", username);
    localStorage.setItem("userId", username);

    setUserId(username);
    setCurrentScene('start'); // after user entry, show start scene
    // console.log("Username submitted:", userId);

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
      {currentScene === 'userEntry' && <UserEntryScreen onSubmit={handleUserSubmit} />}
      {currentScene === 'start' && <StartScene onStart={handleStart} />}
      {currentScene === 'knockGame' && <KnockGame userId={userId} />}
    </div>
  );
}

export default App;
