// index.js (secure-blog)
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));

// Use session for session management
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  },
}));

// Use Helmet for secure headers
app.use(helmet());

// Sample data for blog posts
let posts = [
  { id: 1, title: 'Secure Post 1', content: 'Content of Secure Post 1' },
  { id: 2, title: 'Secure Post 2', content: 'Content of Secure Post 2' },
];

// Middleware to generate CSRF token and make it available to templates
app.use((req, res, next) => {
  res.locals.csrfToken = req.session.csrfToken;
  next();
});

// Route to display all blog posts
app.get('/', (req, res) => {
  res.render('secure-index', { posts });
});

// Route to submit a new blog post
app.get('/submit', (req, res) => {
  // Generate and store CSRF token in the session
  req.session.csrfToken = Math.random().toString(36).slice(2);
  res.render('submit');
});

app.post('/submit', (req, res) => {
  const { title, content } = req.body;
  const id = posts.length + 1;

  posts.push({ id, title, content });
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Secure App is running on port ${PORT}`);
});
