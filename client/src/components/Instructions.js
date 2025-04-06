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
          Each alien ship will be displayed for <b>5 seconds</b>. During this time, you must decide whether to knock or not.
          <b>You must press the space bar before the 5 seconds are over</b>. If you choose not to knock, simply wait and do nothing until the timer runs out.
          A countdown timer will be visible at the <b>top-left corner</b> of the screen to help you keep track.
        </p>
        <p>
          The aliens don’t always reward the same actions! Knocking may earn you points, but sometimes, staying back might be the smarter move.
          Your goal is to collect as many rewards as possible.
        </p>
        <p>
          Enter your <b>roll number</b> as your username.
        </p>
        <p>
          Please <b>open the game link only once</b>. Reloading or opening it multiple times may disrupt your progress and data.
        </p>
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
