import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Simple in-memory database for testing
const users = [
  {
    id: 1,
    username: 'testuser',
    password: 'password123',
    firstname: 'Test',
    lastname: 'User',
    email: 'test@example.com'
  },
  {
    id: 2,
    username: 'john',
    password: 'john123',
    firstname: 'John',
    lastname: 'Doe',
    email: 'john@example.com'
  }
];

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection route
app.get('/api/test-db', (req, res) => {
  res.json({ success: true, message: 'In-memory database is working', userCount: users.length });
});

// Example endpoint for fetching users
app.get('/api/users', (req, res) => {
  try {
    // Return users without passwords
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email
    }));
    res.json(safeUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Login endpoint
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user in in-memory database
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      // In a real app, you'd use JWT tokens or sessions here
      res.json({ 
        success: true, 
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
