// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require("path");
const app = express();
app.use(express.json());
// Open (or create) the SQLite database file
const DBSOURCE = "db.sqlite";
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
        userId INTEGER,
        trialNumber INTEGER,
        stimulus INTEGER,
        reactionTime INTEGER,
        knocked BOOLEAN,
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

const dbPath = path.join(__dirname, './', 'db.sqlite'); // adjust path accordingly

app.post('/api/trialData', (req, res) => {
    const trialData = req.body; // Expected fields: userId, trialNumber, stimulus, reactionTime, correct, scoreChange, newScore
    const { userId, trialNumber, stimulus, reactionTime, knocked, correct, scoreChange, newScore } = trialData;
  
    const sql = `INSERT INTO trial_data (userId, trialNumber, stimulus, reactionTime, knocked, correct, scoreChange, newScore)
                 VALUES (?,?,?,?,?,?,?,?)`;
    const params = [userId, trialNumber, stimulus, reactionTime, knocked, correct, scoreChange, newScore];
  
    db.run(sql, params, function(err) {
      if (err) {
        console.error("Error inserting trial data:", err.message);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.json({ success: true, id: this.lastID });
    });
  });
  
app.get('/download-db', (req, res) => {
  res.download(dbPath, 'experiment-data.sqlite', (err) => {
    if (err) {
      console.error('Error downloading the DB:', err);
      res.status(500).send('Error downloading database');
    }
  });
});

// endpoint to reset the db
app.post('/reset-db', (req, res) => {
  db.serialize(() => {
    db.run("DROP TABLE IF EXISTS trial_data", (err) => {
      if (err) {
        console.error("Error dropping table:", err.message);
        return res.status(500).json({ error: "Internal server error" });
      }
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS trial_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER,
          trialNumber INTEGER,
          stimulus INTEGER,
          reactionTime INTEGER,
          knocked BOOLEAN,
          correct BOOLEAN,
          scoreChange INTEGER,
          newScore INTEGER,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;
      db.run(createTableQuery, (err) => {
        if (err) {
          console.error("Error creating table:", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }
        res.json({ success: true });
      });
    });
  });
});


app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});


// Endpoint to download the SQLite DB


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
