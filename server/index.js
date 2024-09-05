const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const PORT = 3001;

const { encrypt, decrypt } = require('./EncryptionHandler');

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  user: 'root',
  host: 'localhost',
  password: 'welcome',
  database: 'passwordmanager'
});

// Route to check if master password exists
app.get('/masterpassword', (req, res) => {
  db.query("SELECT * FROM masterpassword LIMIT 1", (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Database error');
    } else {
      if (result.length > 0) {
        res.send(result[0]); // Master password exists
      } else {
        res.send({ exists: false }); // No master password in the database
      }
    }
  });
});

// Route to create a master password
app.post('/createmasterpassword', (req, res) => {
  const { password } = req.body;
  const hashedPassword = encrypt(password);

  db.query("INSERT INTO masterpassword (password, iv) VALUES (?, ?)", 
    [hashedPassword.password, hashedPassword.iv], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Database error');
    } else {
      res.send("Master password created successfully");
    }
  });
});

// Route to verify master password
app.post('/verifymasterpassword', (req, res) => {
  const { password } = req.body;

  db.query("SELECT * FROM masterpassword LIMIT 1", (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Database error');
    } else {
      if (result.length > 0) {
        const storedPassword = result[0];
        const decryptedPassword = decrypt({
          password: storedPassword.password,
          iv: storedPassword.iv
        });

        if (decryptedPassword === password) {
          res.send("Master password is correct");
        } else {
          res.status(401).send("Invalid master password");
        }
      } else {
        res.status(404).send("Master password not set");
      }
    }
  });
});

app.get('/showpasswords', (req, res) => {
  db.query('SELECT * FROM passwords', (err, result) => {
    if (err) {
      res.status(500).send('Error fetching passwords');
    } else {
      const decryptedPasswords = result.map((passwordObj) => {
        return {
          ...passwordObj,
          password: decrypt({ password: passwordObj.password, iv: passwordObj.iv })
        };
      });
      res.send(decryptedPasswords); // Send decrypted passwords
    }
  });
});

// Add a new password
app.post('/addpassword', (req, res) => {
  const { password, title } = req.body;
  const hashedPassword = encrypt(password);

  db.query("INSERT INTO passwords (password, title, iv) VALUES (?, ?, ?)", 
    [hashedPassword.password, title, hashedPassword.iv], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Database error');
    } else {
      res.send("Password added successfully");
    }
  });
});

// Delete a password
app.delete('/deletepassword/:id', (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM passwords WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Database error');
    } else {
      res.send('Password deleted successfully');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
