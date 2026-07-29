const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { logAudit } = require('../utils/audit');

// Register a new user/staff
exports.register = async (req, res) => {
  const { username, password, role_id, full_name } = req.body;

  if (!username || !password || !role_id || !full_name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user exists
    const [existingUsers] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Verify role_id exists
    const [roles] = await db.query('SELECT id FROM roles WHERE id = ?', [role_id]);
    if (roles.length === 0) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (username, password, role_id, full_name) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, role_id, full_name]
    );

    await logAudit({
      userId: req.user?.id || null,
      action: 'CREATE_USER',
      entityType: 'users',
      entityId: result.insertId,
      details: JSON.stringify({ username, role_id, full_name }),
    });

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId
    });
  } catch (err) {
    console.error('Registration error:', err);
    const isDbDown = err && (err.code === 'ECONNREFUSED' || (Array.isArray(err.errors) && err.errors.some(e => e && e.code === 'ECONNREFUSED')));
    if (isDbDown) {
      return res.status(503).json({ message: 'Database unavailable. Please start the database and try again.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Login user
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Retrieve user and join role
    const [users] = await db.query(
      `SELECT u.id, u.username, u.password, u.full_name, u.role_id, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.username = ?`,
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Create JWT Payload
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role_id: user.role_id,
        role_name: user.role_name
      }
    };

    // Sign Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretkey_hms2026!',
      { expiresIn: '8h' },
      (err, token) => {
        if (err) throw err;

        logAudit({
          userId: user.id,
          action: 'LOGIN',
          entityType: 'users',
          entityId: user.id,
          details: `User ${user.username} logged in`,
        });

        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            role_name: user.role_name
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    const isDbDown = err && (err.code === 'ECONNREFUSED' || (Array.isArray(err.errors) && err.errors.some(e => e && e.code === 'ECONNREFUSED')));
    if (isDbDown) {
      return res.status(503).json({ message: 'Database unavailable. Please start the database and try again.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Change password for the logged-in user
exports.changePassword = async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }

  try {
    const [users] = await db.query('SELECT id, password, username FROM users WHERE id = ?', [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(current_password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    await logAudit({
      userId: req.user.id,
      action: 'CHANGE_PASSWORD',
      entityType: 'users',
      entityId: req.user.id,
      details: `Password changed for ${user.username}`,
    });

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    const isDbDown = err && (err.code === 'ECONNREFUSED' || (Array.isArray(err.errors) && err.errors.some(e => e && e.code === 'ECONNREFUSED')));
    if (isDbDown) {
      return res.status(503).json({ message: 'Database unavailable. Please start the database and try again.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
