import React, { useState, useEffect } from 'react';
import { 
  Button, 
  TextField, 
  Container, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const App = () => {
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [passwordList, setPasswordList] = useState([]);

  const fetchPasswords = () => {
    axios.get('http://localhost:3001/showpasswords')
      .then((response) => {
        setPasswordList(response.data);
      })
      .catch((error) => {
        console.error('There was an error fetching the passwords!', error);
      });
  };

  useEffect(() => {
    fetchPasswords();
  }, []);

  const addPassword = () => {
    axios.post('http://localhost:3001/addpassword', {
      password: password,
      title: title
    })
      .then((response) => {
        console.log(response.data);
        fetchPasswords();
        setPassword('');
        setTitle('');
      })
      .catch((error) => {
        console.error('There was an error adding the password!', error);
      });
  };

  const decryptPassword = (encryption) => {
    axios.post("http://localhost:3001/decryptpassword", {password: encryption.password, iv: encryption.iv})
      .then((response) => {
        setPasswordList(passwordList.map((val) => {
          return val.id === encryption.id ? {...val, title: `${val.title}: ${response.data}`} : val;
        }));
      });
  };

  const deletePassword = (id) => {
    axios.delete(`http://localhost:3001/deletepassword/${id}`)
      .then((response) => {
        console.log(response.data);
        fetchPasswords();
      })
      .catch((error) => {
        console.error('There was an error deleting the password!', error);
      });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Password Manager
        </Typography>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            fullWidth
            label="Title"
            variant="outlined"
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={addPassword}
            sx={{ mt: 2 }}
          >
            Add Password
          </Button>
        </Box>
        <List sx={{ mt: 4 }}>
          {passwordList.map((val) => (
            <ListItem 
              key={val.id} 
              button 
              onClick={() => decryptPassword({password: val.password, iv: val.iv, id: val.id})}
            >
              <ListItemText primary={val.title} />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="delete" onClick={() => deletePassword(val.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default App;