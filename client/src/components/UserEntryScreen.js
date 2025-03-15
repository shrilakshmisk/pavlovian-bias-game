import React, { useState } from 'react';
import './UserEntryScreen.css';

function UserEntryScreen({ onSubmit }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = username.trim();
  if (trimmed) {
    console.log("UserEntryScreen submitting:", trimmed);
    onSubmit(trimmed);
      // Optionally, here you can also send the username to your backend for registration
      // e.g., registerUser(username.trim());
    }
  };

  return (
    <div className="user-entry-screen">
      <h1>ENTER YOUR USERNAME</h1>
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
