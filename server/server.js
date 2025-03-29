// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
app.use(express.json());
// Open (or create) the SQLite database file
let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error("Could not connect to database", err.message);
    throw err;
  } else {
    console.log('Connected to the SQLite database.');

    // Create a table for trial data if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS trial_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT,
        trialNumber INTEGER,
        stimulus TEXT,
        reactionTime INTEGER,
        correct BOOLEAN,
        scoreChange INTEGER,
        newScore INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    db.run(createTableQuery, (err) => {
      if (err) {
        console.error("Error creating table:", err.message);
      } else {
        console.log("Table 'trial_data' is ready.");
      }
    });
  }
});

app.post('/api/trialData', (req, res) => {
    const trialData = req.body; // Expected fields: userId, trialNumber, stimulus, reactionTime, correct, scoreChange, newScore
    const { userId, trialNumber, stimulus, reactionTime, correct, scoreChange, newScore } = trialData;
  
    const sql = `INSERT INTO trial_data (userId, trialNumber, stimulus, reactionTime, correct, scoreChange, newScore)
                 VALUES (?,?,?,?,?,?,?)`;
    const params = [userId, trialNumber, stimulus, reactionTime, correct, scoreChange, newScore];
  
    db.run(sql, params, function(err) {
      if (err) {
        console.error("Error inserting trial data:", err.message);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.json({ success: true, id: this.lastID });
    });
  });
  
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
