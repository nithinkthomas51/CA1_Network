import express from "express";
import path from "path";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import cors from "cors";

const app = express();
app.use(cors());
const sql3 = sqlite3.verbose();
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../client")));
const PORT = 3000;

const db = new sql3.Database(
  path.join(__dirname, "userDB.db"),
  sqlite3.OPEN_READWRITE,
  dbConnected
);

db.exec(
  "CREATE TABLE IF NOT EXISTS users ( user_id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, email TEXT NOT NULL)",
  (err) => {
    if (err) {
      console.log("Failed to create user table: " + err.message);
      return;
    }
    console.log("Created user table");
  }
);

app.post("/submit", (req, res) => {
  const { name, email } = req.body;
  db.run(
    "INSERT INTO users (username, email) VALUES (?, ?)",
    [name, email],
    (err) => {
      if (err) {
        console.log(err.message);
        return res.status(500).send("Database Error");
      }
      res.send("User Saved");
    }
  );
});

app.get("/users", (req, res) => {
  let users = { user: [] };
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      console.log(err.message);
      return res.status(500).send("Failed to fetch users");
    }
    rows.forEach((row) => {
      users.user.push({
        name: row.username,
        email: row.email,
      });
    });
    return res.status(200).json(users.user);
  });
});

function dbConnected(err) {
  if (err) {
    console.log("Failed to load the database: " + err.message);
    return;
  }
  console.log("Database created/exists");
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
