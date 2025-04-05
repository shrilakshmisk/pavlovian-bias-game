import React, { useEffect } from "react";

const Instructions = ({ onClose }) => {
  // Detect space bar press to close the instructions
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      padding: "20px",
      textAlign: "center"
    }}>
      <div style={{
        backgroundColor: "#222",
        padding: "20px",
        borderRadius: "10px",
        maxWidth: "600px"
      }}>
        <h2>Game Instructions</h2>
        <p>
          You’re about to embark on a mission where you’ll interact with mysterious alien ships appearing in Earth’s orbit. There are 4 types of alien ships. They differ in how they look. 
          Each ship will be either <b style={{ color: "red" }}>red</b> or <b style={{ color: "green" }}>green</b>, and your task is to decide whether to knock on it or not. Pay attention to other features too.
        </p>
        <p><b>Press the space bar</b> to knock. Doing nothing means you choose not to knock.</p>
        <p>
          The aliens don’t always reward the same actions! Knocking may earn you points, but sometimes, staying back might be the smarter move.
          Your goal is to collect as many rewards as possible.
        </p>
        <p>
          To begin, you will first complete a short <b>practice trial</b> to get familiar with how the game works.  
          For the practice, please enter your roll number as your username and continue.
        </p>
        <p>
          In the final experiment, make sure to enter your <b>roll number</b> as your username.
        </p>
        <p>The entire game spans approximately <b>30 minutes</b>, so make sure you’re comfortable and free from distractions before starting.</p>
        <p><b>Press the space bar or click "Got it!" to continue 🚀</b></p>
        <button 
          onClick={onClose} 
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default Instructions;
