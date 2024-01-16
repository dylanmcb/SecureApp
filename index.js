// index.js
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));

const db = new sqlite3.Database(':memory:');

// Create a simple posts table in the database
db.serialize(() => {
  db.run('CREATE TABLE posts (id INT, title TEXT, content TEXT)');
});

// Sample data for blog posts
const samplePosts = [
  { id: 1, title: 'Post 1', content: 'Content of Post 1' },
  { id: 2, title: 'Post 2', content: 'Content of Post 2' },
];

// Track submitted posts
let submittedPosts = [];

// Route to display the form for submitting a new blog post
app.get('/submit', (req, res) => {
  res.render('submit');
});

// Route to handle form submission (vulnerable to SQL injection)
app.post('/submit', (req, res) => {
  const { title, content } = req.body;

  // Vulnerability: Sensitive Data Exposure - Logging sensitive data
  console.log(`Submitted Title: ${title}, Submitted Content: ${content}`);

  // Vulnerability: SQL Injection - User input is directly concatenated into the SQL query
  const query = 'INSERT INTO posts VALUES (?, ?, ?)';
  db.run(query, [samplePosts.length + submittedPosts.length + 1, title, content], (err) => {
    if (err) {
      console.error(err);
    }

    // Store the submitted post
    submittedPosts.push({ title, content });

    // Redirect to the home page
    res.redirect('/');
  });
});

// Route to display all blog posts
app.get('/', (req, res) => {
  const userInput = req.query.input || '';
  console.log(`Sensitive Data: ${userInput}`);

  // Vulnerability: SQL Injection - User input is directly concatenated into the SQL query
  const sql = `SELECT * FROM posts WHERE title = '${userInput}'`;
  db.all(sql, [], (err, posts) => {
    if (err) {
      console.error(err);
    }

    // Vulnerability: Reflected XSS - User input is directly rendered in the template
    res.render('insecure-index', { posts, userInput, submittedPosts });
  });
});

app.listen(PORT, () => {
  console.log(`Insecure App is running on port ${PORT}`);
});
