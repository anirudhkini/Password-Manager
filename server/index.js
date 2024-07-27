const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const PORT = 3001;

const {encrypt, decrypt} = require ('./EncryptionHandler')

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  user: 'root',
  host: 'localhost',
  password: 'welcome',
  database: 'passwordmanager' 
});

app.post('/addpassword', (req, res) => {
  const { password, title } = req.body;
  const hashedPassword = encrypt(password);

  db.query("INSERT INTO passwords (password, title, iv) VALUES (?,?,?)", [hashedPassword.password, title, hashedPassword.iv], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).send('Database error');
    } else {
      res.send("Success");
    }
  });
});

app.get('/showpasswords', (req,res) => {
  db.query('SELECT * FROM passwords;', (err,result)=>{
    if(err){
      console.log(err);
      res.status(500).send('Database error');
    }else{
      res.send(result);
    }
  })
})

app.post('/decryptpassword', (req, res)=>{
  res.send(decrypt(req.body))
})

// New delete endpoint
app.delete('/deletepassword/:id', (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM passwords WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).send('Database error');
    } else {
      res.send("Password deleted successfully");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});