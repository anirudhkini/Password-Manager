import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  IconButton,
  Collapse
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const App = () => {
  const [masterPassword, setMasterPassword] = useState('');
  const [enteredMasterPassword, setEnteredMasterPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMasterPasswordSet, setIsMasterPasswordSet] = useState(false);
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [passwordList, setPasswordList] = useState([]);
  const [expandedPasswordId, setExpandedPasswordId] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3001/masterpassword')
      .then((response) => {
        setIsMasterPasswordSet(response.data.exists !== false);
      })
      .catch((error) => {
        console.error('There was an error checking the master password!', error);
      });
  }, []);

  const verifyMasterPassword = () => {
    axios.post('http://localhost:3001/verifymasterpassword', { password: enteredMasterPassword })
      .then(() => {
        setIsAuthenticated(true);
      })
      .catch(() => {
        alert('Invalid master password');
      });
  };

  const createMasterPassword = () => {
    axios.post('http://localhost:3001/createmasterpassword', { password: masterPassword })
      .then(() => {
        setIsMasterPasswordSet(true);
        setIsAuthenticated(true);
      })
      .catch((error) => {
        console.error('There was an error creating the master password!', error);
      });
  };

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
    if (isAuthenticated) {
      fetchPasswords();
    }
  }, [isAuthenticated]);

  const addPassword = () => {
    axios.post('http://localhost:3001/addpassword', {
      password: password,
      title: title,
    })
      .then(() => {
        fetchPasswords();
        setPassword('');
        setTitle('');
      })
      .catch((error) => {
        console.error('There was an error adding the password!', error);
      });
  };

  const deletePassword = (id) => {
    axios.delete(`http://localhost:3001/deletepassword/${id}`)
      .then(() => {
        fetchPasswords();
      })
      .catch((error) => {
        console.error('There was an error deleting the password!', error);
      });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        {!isAuthenticated ? (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {isMasterPasswordSet ? 'Enter Master Password' : 'Create Master Password'}
            </Typography>
            <TextField
              fullWidth
              label="Master Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={isMasterPasswordSet ? enteredMasterPassword : masterPassword}
              onChange={(e) => isMasterPasswordSet ? setEnteredMasterPassword(e.target.value) : setMasterPassword(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={isMasterPasswordSet ? verifyMasterPassword : createMasterPassword}
              sx={{ mt: 2 }}
            >
              {isMasterPasswordSet ? 'Enter' : 'Create'}
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Password Manager
            </Typography>
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

            <Box sx={{ mt: 4 }}>
              {passwordList.map((val) => (
                <Box key={val.id} sx={{ mb: 2, border: '1px solid gray', borderRadius: '4px', p: 2 }}>
                  <Typography variant="h6">
                    {val.title}
                    <IconButton
                      onClick={() => deletePassword(val.id)}
                      sx={{ ml: 2 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Typography>
                  <Collapse in={expandedPasswordId === val.id}>
                    <Typography variant="body1"><strong>Password:</strong> {val.password}</Typography>
                  </Collapse>
                  <Button
                    variant="outlined"
                    onClick={() => setExpandedPasswordId(expandedPasswordId === val.id ? null : val.id)}
                  >
                    {expandedPasswordId === val.id ? 'Hide' : 'Show'}
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default App;
