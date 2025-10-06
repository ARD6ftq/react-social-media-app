import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection route
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ success: true, result: rows });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ success: false, message: 'Database connection failed.' });
  }
});

// Example endpoint for fetching users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, firstname, lastname, email FROM users');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Query user from database
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      const user = rows[0] as any;
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

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { firstname, lastname, username, email, password, confirmPassword } = req.body;
    
    // Validate required fields
    if (!firstname || !lastname || !username || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Check if username already exists
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    // Check if email already exists
    const [existingEmail] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingEmail) && existingEmail.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Create new user
    const [result] = await pool.query(
      'INSERT INTO users (username, password, firstname, lastname, email) VALUES (?, ?, ?, ?, ?)',
      [username, password, firstname, lastname, email]
    );

    const insertResult = result as any;
    const newUserId = insertResult.insertId;

    // Return success response (without password)
    res.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUserId,
        username,
        firstname,
        lastname,
        email
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
});

// Posts API Routes

// Get all posts with author info, likes count, and comments count
app.get('/api/posts', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.*,
        u.username as author_username,
        u.firstname as author_firstname,
        u.lastname as author_lastname,
        u.email as author_email,
        COALESCE(pl.likes_count, 0) as likes_count,
        COALESCE(pc.comments_count, 0) as comments_count
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN (
        SELECT post_id, COUNT(*) as likes_count 
        FROM post_likes 
        GROUP BY post_id
      ) pl ON p.id = pl.post_id
      LEFT JOIN (
        SELECT post_id, COUNT(*) as comments_count 
        FROM comments 
        GROUP BY post_id
      ) pc ON p.id = pc.post_id
      ORDER BY p.created_at DESC
    `);
    
    // Get current user ID from query param (for checking if user liked posts)
    const currentUserId = req.query.user_id;
    
    const posts = await Promise.all(
      (rows as any[]).map(async (post) => {
        let is_liked = false;
        if (currentUserId) {
          const [likeRows] = await pool.query(
            'SELECT id FROM post_likes WHERE user_id = ? AND post_id = ?',
            [currentUserId, post.id]
          );
          is_liked = Array.isArray(likeRows) && likeRows.length > 0;
        }
        
        return {
          id: post.id,
          user_id: post.user_id,
          content: post.content,
          created_at: post.created_at,
          updated_at: post.updated_at,
          author: {
            id: post.user_id,
            username: post.author_username,
            firstname: post.author_firstname,
            lastname: post.author_lastname,
            email: post.author_email
          },
          likes_count: post.likes_count,
          comments_count: post.comments_count,
          is_liked
        };
      })
    );
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Create a new post
app.post('/api/posts', async (req, res) => {
  try {
    const { content, user_id } = req.body;
    
    if (!content || !user_id) {
      return res.status(400).json({ message: 'Content and user_id are required' });
    }
    
    if (content.length > 500) {
      return res.status(400).json({ message: 'Post content cannot exceed 500 characters' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO posts (user_id, content) VALUES (?, ?)',
      [user_id, content]
    );
    
    const insertResult = result as any;
    const postId = insertResult.insertId;
    
    // Fetch the created post with author info
    const [postRows] = await pool.query(`
      SELECT 
        p.*,
        u.username as author_username,
        u.firstname as author_firstname,
        u.lastname as author_lastname,
        u.email as author_email
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [postId]);
    
    const post = (postRows as any[])[0];
    
    res.json({
      success: true,
      message: 'Post created successfully',
      post: {
        id: post.id,
        user_id: post.user_id,
        content: post.content,
        created_at: post.created_at,
        updated_at: post.updated_at,
        author: {
          id: post.user_id,
          username: post.author_username,
          firstname: post.author_firstname,
          lastname: post.author_lastname,
          email: post.author_email
        },
        likes_count: 0,
        comments_count: 0,
        is_liked: false
      }
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Delete a post (only by author)
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Check if user owns the post
    const [postRows] = await pool.query(
      'SELECT user_id FROM posts WHERE id = ?',
      [postId]
    );
    
    if (Array.isArray(postRows) && postRows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const post = (postRows as any[])[0];
    if (post.user_id !== user_id) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }
    
    await pool.query('DELETE FROM posts WHERE id = ?', [postId]);
    
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// Likes API Routes

// Like/Unlike a post
app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const postId = req.params.id;
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Check if user already liked the post
    const [existingLike] = await pool.query(
      'SELECT id FROM post_likes WHERE user_id = ? AND post_id = ?',
      [user_id, postId]
    );
    
    if (Array.isArray(existingLike) && existingLike.length > 0) {
      // Unlike the post
      await pool.query(
        'DELETE FROM post_likes WHERE user_id = ? AND post_id = ?',
        [user_id, postId]
      );
    } else {
      // Like the post
      await pool.query(
        'INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)',
        [user_id, postId]
      );
    }
    
    // Get updated likes count
    const [likesCount] = await pool.query(
      'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?',
      [postId]
    );
    
    const count = (likesCount as any[])[0].count;
    const is_liked = Array.isArray(existingLike) && existingLike.length === 0;
    
    res.json({
      success: true,
      message: is_liked ? 'Post liked' : 'Post unliked',
      likes_count: count,
      is_liked: is_liked
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Error toggling like' });
  }
});

// Comments API Routes

// Get comments for a post
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const postId = req.params.id;
    const currentUserId = req.query.user_id;
    
    const [rows] = await pool.query(`
      SELECT 
        c.*,
        u.username as author_username,
        u.firstname as author_firstname,
        u.lastname as author_lastname,
        u.email as author_email,
        COALESCE(cl.likes_count, 0) as likes_count
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN (
        SELECT comment_id, COUNT(*) as likes_count 
        FROM comment_likes 
        GROUP BY comment_id
      ) cl ON c.id = cl.comment_id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [postId]);
    
    const comments = await Promise.all(
      (rows as any[]).map(async (comment) => {
        let is_liked = false;
        if (currentUserId) {
          const [likeRows] = await pool.query(
            'SELECT id FROM comment_likes WHERE user_id = ? AND comment_id = ?',
            [currentUserId, comment.id]
          );
          is_liked = Array.isArray(likeRows) && likeRows.length > 0;
        }
        
        return {
          id: comment.id,
          user_id: comment.user_id,
          post_id: comment.post_id,
          content: comment.content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          author: {
            id: comment.user_id,
            username: comment.author_username,
            firstname: comment.author_firstname,
            lastname: comment.author_lastname,
            email: comment.author_email
          },
          likes_count: comment.likes_count,
          is_liked
        };
      })
    );
    
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// Create a comment
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const postId = req.params.id;
    const { content, user_id } = req.body;
    
    if (!content || !user_id) {
      return res.status(400).json({ message: 'Content and user_id are required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)',
      [user_id, postId, content]
    );
    
    const insertResult = result as any;
    const commentId = insertResult.insertId;
    
    // Fetch the created comment with author info
    const [commentRows] = await pool.query(`
      SELECT 
        c.*,
        u.username as author_username,
        u.firstname as author_firstname,
        u.lastname as author_lastname,
        u.email as author_email
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [commentId]);
    
    const comment = (commentRows as any[])[0];
    
    res.json({
      success: true,
      message: 'Comment created successfully',
      comment: {
        id: comment.id,
        user_id: comment.user_id,
        post_id: comment.post_id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        author: {
          id: comment.user_id,
          username: comment.author_username,
          firstname: comment.author_firstname,
          lastname: comment.author_lastname,
          email: comment.author_email
        },
        likes_count: 0,
        is_liked: false
      }
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Error creating comment' });
  }
});

// Like/Unlike a comment
app.post('/api/comments/:id/like', async (req, res) => {
  try {
    const commentId = req.params.id;
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Check if user already liked the comment
    const [existingLike] = await pool.query(
      'SELECT id FROM comment_likes WHERE user_id = ? AND comment_id = ?',
      [user_id, commentId]
    );
    
    if (Array.isArray(existingLike) && existingLike.length > 0) {
      // Unlike the comment
      await pool.query(
        'DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?',
        [user_id, commentId]
      );
    } else {
      // Like the comment
      await pool.query(
        'INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)',
        [user_id, commentId]
      );
    }
    
    // Get updated likes count
    const [likesCount] = await pool.query(
      'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?',
      [commentId]
    );
    
    const count = (likesCount as any[])[0].count;
    const is_liked = Array.isArray(existingLike) && existingLike.length === 0;
    
    res.json({
      success: true,
      message: is_liked ? 'Comment liked' : 'Comment unliked',
      likes_count: count,
      is_liked: is_liked
    });
  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({ message: 'Error toggling comment like' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
