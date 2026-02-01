const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Array to store registered users
let users = [];

// Helper function to check if username is valid (exists in users array)
const isValid = (username) => {
    return users.some(u => u.username === username);
}

// Helper function to authenticate username & password
const authenticatedUser = (username, password) => {
    return users.some(u => u.username === username && u.password === password);
}

// Login route - only registered users
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Create JWT token
    const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });

    // Save token in session
    req.session.authorization = { accessToken, username };

    return res.json({ message: "User successfully logged in", token: accessToken });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review; // review comes in query params
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews) books[isbn].reviews = {};

    // Add or modify review by this user
    books[isbn].reviews[username] = review;

    return res.json({ message: "Review added/modified successfully", reviews: books[isbn].reviews });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (!books[isbn] || !books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found" });
    }

    delete books[isbn].reviews[username];

    return res.json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
