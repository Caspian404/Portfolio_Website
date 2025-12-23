const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const https = require('https');
const fs = require('fs');
const axios = require('axios');
//const rateLimit = require('express-rate-limit');
const rateLimit = require('express-rate-limit');
// CAPTCHA store (per IP)
const captchaStore = {};

require('dotenv').config();

// reCAPTCHA verification function
async function verifyRecaptcha(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY not configured');
    return false;
  }

  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: secretKey,
          response: token
        }
      }
    );
    
    return response.data.success === true;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error.message);
    return false;
  }
}

const app = express();

// Trust proxy - needed for rate limiting to work correctly
app.set('trust proxy', 1);

// SSL Certificate configuration
const sslOptions = {
  key: fs.readFileSync(__dirname + '/localhost+2-key.pem'),
  cert: fs.readFileSync(__dirname + '/localhost+2.pem')
};

// Middleware

app.use(cors({
  origin: true,  // Allow the requesting origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// MySQL Connections - Separate login and information databases
// Important: allow empty string passwords (XAMPP/MariaDB default) when DB_PASSWORD is defined but empty
const resolvedHost = process.env.DB_HOST || 'localhost';
const resolvedUser = process.env.DB_USER || 'root';
const resolvedPassword = (process.env.DB_PASSWORD !== undefined)
  ? process.env.DB_PASSWORD // respect empty string
  : 'password'; // fallback only if env var is truly undefined

const loginDb = mysql.createConnection({
  host: resolvedHost,
  user: resolvedUser,
  password: resolvedPassword,
  database: 'login_db'
});

const infoDb = mysql.createConnection({
  host: resolvedHost,
  user: resolvedUser,
  password: resolvedPassword,
  database: 'info_db'
});

loginDb.connect((err) => {
  if (err) {
    console.error('Error connecting to login database:', err);
    return;
  }
  console.log('Connected to login database');
});

infoDb.connect((err) => {
  if (err) {
    console.error('Error connecting to information database:', err);
    return;
  }
  console.log('Connected to information database');
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

// Middleware to check user role
const checkRole = (roles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Get user role from login database
      const [users] = await loginDb.promise().query('SELECT role FROM users WHERE id = ?', [decoded.userId]);
      if (users.length === 0) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!roles.includes(users[0].role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      req.user = decoded;
      req.userRole = users[0].role;
      next();
    });
  };
};

// Helper function to log transactions
const logTransaction = async (userId, transactionType, description, amount = null, studentId = null) => {
  try {
    await infoDb.promise().query(
      'INSERT INTO transactions (user_id, transaction_type, description, amount, student_id) VALUES (?, ?, ?, ?, ?)',
      [userId, transactionType, description, amount, studentId]
    );
  } catch (error) {
    console.error('Error logging transaction:', error);
  }
};

// ========== STOP SPAM BOTS ==========
const loginAttempts = new Map();
const LOCKOUT_TIME = 1 * 60 * 1000; // 15 minutes lockout
const MAX_ATTEMPTS = 2; // Maximum attempts before lockout - matches loginLimiter


const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  handler: (req, res) => {
    console.log(`[RATE LIMIT] IP ${req.ip} exceeded login attempts`);
    res.status(429).json({
      error: 'Too many login attempts from this IP',
      message: 'Please try again after 1 minutes',
      attemptsRemaining: 0,
      locked: true
    });
  }
});

// Sensitive operations rate limiter
const sensitiveLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 sensitive operations per windowMs
  message: {
    error: 'Too many sensitive operations from this IP, please try again after 15 minutes'
  }
});

// General API rate limiter for other endpoints
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Student Information System Backend' });
});

// ==================== AUTHENTICATION ROUTES ====================
// Register route (Admin only)
app.post('/api/register', checkRole(['admin']), sensitiveLimiter, async (req, res) => {
  try {
    const { username, email, password, role = 'student', first_name, last_name } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate faculty-specific fields
    if (role === 'faculty' && (!first_name || !last_name)) {
      return res.status(400).json({ message: 'First name and last name are required for faculty' });
    }

    // Check if user exists
    const [existingUsers] = await loginDb.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password and username
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedUsername = await bcrypt.hash(username, 10);

    // Create user
    const [result] = await loginDb.promise().query(
      'INSERT INTO users (username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
      [hashedUsername, email, hashedPassword, role, true]
    );

    // If faculty, create faculty record
    if (role === 'faculty') {
      await infoDb.promise().query(
        'INSERT INTO faculty (user_id, first_name, last_name, email) VALUES (?, ?, ?, ?)',
        [result.insertId, first_name, last_name, email]
      );
    }

    await logTransaction(result.insertId, 'USER_REGISTRATION', `User ${username} registered as ${role}`);

    res.status(201).json({ 
      message: 'User created successfully',
      userId: result.insertId,
      username,
      role
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// ==================== AUTHENTICATION ROUTES ==================== 
app.get('/api/captcha', apiLimiter, (req, res) => {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;

  const answer = a + b;

  // link CAPTCHA to user IP address
  captchaStore[req.ip] = answer;

  res.json({
    captchaQuestion: `What is ${a} + ${b}?`
  });
});
// CAPTCHA VERIFICATION
app.post('/api/verify-captcha', (req, res) => {
  const { answer } = req.body;
  const expected = captchaStore[req.ip];

  if (!expected) {
    return res.status(400).json({ message: "No CAPTCHA generated." });
  }

  if (parseInt(answer) !== expected) {
    return res.status(400).json({ message: "Incorrect CAPTCHA" });
  }

  delete captchaStore[req.ip];
  res.json({ success: true });
});


// Login route
app.post('/api/login', loginLimiter, async (req, res) => {
  try {
    const { email, password, recaptchaToken, captchaAnswer } = req.body;
    const ip = req.ip;
    
    console.log(`[LOGIN ATTEMPT] IP: ${ip}, Email: ${email}`);
    
    // Verify reCAPTCHA if token is provided (preferred method)
    if (recaptchaToken) {
      const isValidRecaptcha = await verifyRecaptcha(recaptchaToken);
      if (!isValidRecaptcha) {
        return res.status(400).json({ message: "reCAPTCHA verification failed" });
      }
    }
    // Fallback to arithmetic CAPTCHA if old clients still use it
    else if (captchaAnswer) {
      const expectedCaptcha = captchaStore[ip];
      if (!expectedCaptcha) {
        return res.status(400).json({ message: "CAPTCHA not generated for this session" });
      }
      if (parseInt(captchaAnswer) !== expectedCaptcha) {
        return res.status(401).json({ message: "Incorrect CAPTCHA" });
      }
      delete captchaStore[ip];
    }
    // No CAPTCHA provided at all
    else {
      return res.status(400).json({ message: "CAPTCHA verification required" });
    }

    
    // Check if IP is locked
    const attempts = loginAttempts.get(ip);

    
    if (attempts && attempts.count >= MAX_ATTEMPTS) {
      const timeSinceFirstAttempt = Date.now() - attempts.firstAttempt;
      if (timeSinceFirstAttempt < LOCKOUT_TIME) {
        const minutesLeft = Math.ceil((LOCKOUT_TIME - timeSinceFirstAttempt) / 1000 / 60);
        return res.status(429).json({
          error: `Account temporarily locked. Try again in ${minutesLeft} minutes.`,
          attemptsRemaining: 0,
          locked: true,
          retryAfter: minutesLeft
        });
      } else {
        // Reset attempts after lockout period
        loginAttempts.delete(ip);
      }
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user in login database
    const [users] = await loginDb.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Track failed attempt
      const currentAttempts = loginAttempts.get(ip) || { count: 0, firstAttempt: Date.now() };
      currentAttempts.count++;
      loginAttempts.set(ip, currentAttempts);
      
      const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - currentAttempts.count);
      
      return res.status(401).json({ 
        message: 'Invalid credentials',
        attemptsRemaining: attemptsRemaining,
        locked: attemptsRemaining <= 0
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ message: 'Account is inactive' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // Track failed attempt
      const currentAttempts = loginAttempts.get(ip) || { count: 0, firstAttempt: Date.now() };
      currentAttempts.count++;
      loginAttempts.set(ip, currentAttempts);
      
      const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - currentAttempts.count);
      
      return res.status(401).json({ 
        message: 'Invalid credentials',
        attemptsRemaining: attemptsRemaining,
        locked: attemptsRemaining <= 0
      });
    }

    // SUCCESSFUL LOGIN - reset attempts
    loginAttempts.delete(ip);

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '3m' }
    );

    await logTransaction(user.id, 'LOGIN', `${user.email} logged in`);

    res.json({
      token,
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      attemptsRemaining: MAX_ATTEMPTS
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});
// ==================== STUDENT ROUTES ====================

// Get student profile
app.get('/api/students/profile', verifyToken, async (req, res) => {
  try {
    const [students] = await infoDb.promise().query(
      'SELECT * FROM students WHERE user_id = ?',
      [req.user.userId]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    await logTransaction(req.user.userId, 'VIEW_PROFILE', 'Student viewed their profile', null, students[0].id);

    res.json(students[0]);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Update student profile
app.put('/api/students/profile', verifyToken, async (req, res) => {
  try {
    const { first_name, last_name, phone_number, address, city, state, zip_code } = req.body;

    const [students] = await infoDb.promise().query(
      'SELECT id FROM students WHERE user_id = ?',
      [req.user.userId]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const studentId = students[0].id;

    await infoDb.promise().query(
      'UPDATE students SET first_name = ?, last_name = ?, phone_number = ?, address = ?, city = ?, state = ?, zip_code = ? WHERE id = ?',
      [first_name, last_name, phone_number, address, city, state, zip_code, studentId]
    );

    await logTransaction(req.user.userId, 'UPDATE_PROFILE', 'Student updated their profile', null, studentId);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Get student account balance
app.get('/api/students/balance', verifyToken, async (req, res) => {
  try {
    const [students] = await infoDb.promise().query(
      'SELECT id, account_balance FROM students WHERE user_id = ?',
      [req.user.userId]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await logTransaction(req.user.userId, 'VIEW_BALANCE', 'Student viewed account balance', null, students[0].id);

    res.json({ 
      account_balance: students[0].account_balance,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Get student GPA and credits
app.get('/api/students/academic', verifyToken, async (req, res) => {
  try {
    const [students] = await infoDb.promise().query(
      'SELECT id, gpa, total_credits FROM students WHERE user_id = ?',
      [req.user.userId]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await logTransaction(req.user.userId, 'VIEW_ACADEMIC', 'Student viewed academic info', null, students[0].id);

    res.json({ 
      gpa: students[0].gpa,
      total_credits: students[0].total_credits,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching academic info:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// ==================== FACULTY ROUTES ====================

// Create student account (Faculty only)
app.post('/api/faculty/students', checkRole(['faculty', 'admin']), async (req, res) => {
  try {
    const { username, email, password, bluegold_id, first_name, last_name } = req.body;

    if (!username || !email || !password || !bluegold_id || !first_name || !last_name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if email exists (username will be hashed so we can't check it directly)
    const [existingUsers] = await loginDb.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password and username for storage
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedUsername = await bcrypt.hash(username, 10);

    // Create user
    const [userResult] = await loginDb.promise().query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [hashedUsername, email, hashedPassword, 'student']
    );

    // Create student record
    const [studentResult] = await infoDb.promise().query(
      'INSERT INTO students (user_id, bluegold_id, first_name, last_name, email, enrollment_date) VALUES (?, ?, ?, ?, ?, ?)',
      [userResult.insertId, bluegold_id, first_name, last_name, email, new Date()]
    );

    await logTransaction(req.user.userId, 'CREATE_STUDENT', `Faculty created student account for ${username}`, null, studentResult.insertId);

    res.status(201).json({ 
      message: 'Student account created successfully',
      userId: userResult.insertId,
      studentId: studentResult.insertId
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Get all students (Faculty only)
app.get('/api/faculty/students', checkRole(['faculty', 'admin']), async (req, res) => {
  try {
    const [students] = await infoDb.promise().query(
      'SELECT id, user_id, bluegold_id, first_name, last_name, email, gpa, total_credits, account_balance FROM students ORDER BY id ASC'
    );

    console.log(`Faculty/Admin fetched ${students.length} students`);
    await logTransaction(req.user.userId, 'VIEW_ALL_STUDENTS', `Faculty viewed all students (${students.length} records)`);

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Get student details (Faculty only)
app.get('/api/faculty/students/:studentId', checkRole(['faculty', 'admin']), async (req, res) => {
  try {
    const { studentId } = req.params;

    const [students] = await infoDb.promise().query(
      'SELECT * FROM students WHERE id = ?',
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await logTransaction(req.user.userId, 'VIEW_STUDENT_DETAILS', `Faculty viewed student ${studentId} details`, null, studentId);

    res.json(students[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Update student information (Faculty only)
app.put('/api/faculty/students/:studentId', checkRole(['faculty', 'admin']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { gpa, total_credits, account_balance } = req.body;

    await infoDb.promise().query(
      'UPDATE students SET gpa = ?, total_credits = ?, account_balance = ? WHERE id = ?',
      [gpa, total_credits, account_balance, studentId]
    );

    await logTransaction(req.user.userId, 'UPDATE_STUDENT', `Faculty updated student ${studentId}`, null, studentId);

    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Charge tuition (Faculty only)
app.post('/api/faculty/tuition', checkRole(['faculty', 'admin']), async (req, res) => {
  try {
    const { student_id, amount, description, due_date } = req.body;

    if (!student_id || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [result] = await infoDb.promise().query(
      'INSERT INTO tuition_charges (student_id, amount, description, charged_by, due_date) VALUES (?, ?, ?, ?, ?)',
      [student_id, amount, description, req.user.userId, due_date]
    );

    // Update student account balance
    await infoDb.promise().query(
      'UPDATE students SET account_balance = account_balance + ? WHERE id = ?',
      [amount, student_id]
    );

    await logTransaction(req.user.userId, 'CHARGE_TUITION', `Charged $${amount} tuition to student ${student_id}`, amount, student_id);

    res.status(201).json({ 
      message: 'Tuition charged successfully',
      chargeId: result.insertId
    });
  } catch (error) {
    console.error('Error charging tuition:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Get student tuition charges (Faculty only)
app.get('/api/faculty/tuition/:studentId', checkRole(['faculty', 'admin']), async (req, res) => {
  try {
    const { studentId } = req.params;

    const [charges] = await infoDb.promise().query(
      'SELECT * FROM tuition_charges WHERE student_id = ?',
      [studentId]
    );

    await logTransaction(req.user.userId, 'VIEW_TUITION', `Faculty viewed tuition for student ${studentId}`, null, studentId);

    res.json(charges);
  } catch (error) {
    console.error('Error fetching tuition charges:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// ==================== TRANSACTION LOG ROUTES ====================

// Get transaction history
app.get('/api/transactions', verifyToken, async (req, res) => {
  try {
    const [transactions] = await infoDb.promise().query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.userId]
    );

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Get all transactions (Admin only)
app.get('/api/admin/transactions', checkRole(['admin']), async (req, res) => {
  try {
    const [transactions] = await infoDb.promise().query(
      'SELECT * FROM transactions ORDER BY created_at DESC LIMIT 100'
    );

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Get all users (Admin only)
app.get('/api/admin/users', checkRole(['admin']), async (req, res) => {
  try {
    // Get all users from login database
    const [users] = await loginDb.promise().query(
      'SELECT id, username, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );

    // For each user, get their student or faculty record
    const usersWithDetails = await Promise.all(users.map(async (user) => {
      if (user.role === 'student') {
        const [students] = await infoDb.promise().query(
          'SELECT bluegold_id, first_name, last_name, gpa, total_credits, account_balance FROM students WHERE user_id = ?',
          [user.id]
        );
        
        if (students.length > 0) {
          return {
            ...user,
            ...students[0]
          };
        }
      } else if (user.role === 'faculty') {
        const [faculty] = await infoDb.promise().query(
          'SELECT first_name, last_name FROM faculty WHERE user_id = ?',
          [user.id]
        );
        
        if (faculty.length > 0) {
          return {
            ...user,
            ...faculty[0]
          };
        }
      }
      return user;
    }));

    res.json(usersWithDetails);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Delete user (Admin only)
app.delete('/api/admin/users/:userId', checkRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Don't allow admin to delete themselves
    if (parseInt(userId) === req.user.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Get user info before deletion
    const [users] = await loginDb.promise().query(
      'SELECT role, username FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userToDelete = users[0];

    // Start transaction
    await loginDb.promise().query('START TRANSACTION');

    try {
      // Delete student record if user is a student
      if (userToDelete.role === 'student') {
        await infoDb.promise().query(
          'DELETE FROM students WHERE user_id = ?',
          [userId]
        );
      }

      // Delete faculty record if user is faculty
      if (userToDelete.role === 'faculty') {
        await infoDb.promise().query(
          'DELETE FROM faculty WHERE user_id = ?',
          [userId]
        );
      }

      // Delete user record from login database
      await loginDb.promise().query(
        'DELETE FROM users WHERE id = ?',
        [userId]
      );

      // Log the deletion
      await logTransaction(req.user.userId, 'DELETE_USER', `Admin deleted user ${userToDelete.username} (${userToDelete.role})`);

      await loginDb.promise().query('COMMIT');

      res.json({ message: 'User deleted successfully' });
    } catch (deleteError) {
      await loginDb.promise().query('ROLLBACK');
      throw deleteError;
    }
  } catch (error) {

    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Change Password (All authenticated users)
app.post('/api/change-password', verifyToken, sensitiveLimiter, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Get current user from login database
    const [users] = await loginDb.promise().query(
      'SELECT * FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in login database
    await loginDb.promise().query(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedNewPassword, req.user.userId]
    );

    // Log the password change
    await logTransaction(req.user.userId, 'PASSWORD_CHANGE', 'User changed their password');

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
https.createServer(sslOptions, app).listen(PORT, '0.0.0.0', () => {
  console.log(`Secure server is running on port ${PORT}`);
  console.log('Server is accessible from all network interfaces');
  console.log('HTTPS enabled with SSL/TLS');
});
