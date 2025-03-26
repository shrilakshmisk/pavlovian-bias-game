import React, { useState } from 'react';
import './UserEntryScreen.css';
import background from '../assets/background.jpeg';  // Import the background image

function UserEntryScreen({ onSubmit }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed) {
      console.log("UserEntryScreen submitting:", trimmed);
      onSubmit(trimmed);
    }
  };

  // ✅ Inline style for background image
  const backgroundStyle = {
    backgroundImage: `url(${background})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={backgroundStyle}>
    <h1 class="enter-name">ENTER YOUR NAME</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="username-input"
          autoFocus
        />
        <button type="submit" className="submit-button">SUBMIT</button>
      </form>
    </div>
  );
}

export default UserEntryScreen;
