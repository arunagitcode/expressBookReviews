const express = require('express');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users; // existing users array
const public_users = express.Router();

// Helper function to simulate async operation (like DB/API)
const getBooksAsync = () => new Promise((resolve) => {
    resolve(books);
});

// Register a new user
public_users.post("/register", async (req,res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username and password required" });
        }

        if (users.some(u => u.username === username)) {
            return res.status(400).json({ message: "Username already exists" });
        }

        users.push({ username, password });
        return res.json({ message: "User successfully registered" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const allBooks = await getBooksAsync();
        return res.send(JSON.stringify(allBooks, null, 4));
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        const allBooks = await getBooksAsync();
        const book = allBooks[isbn];
        if (book) {
            return res.send(JSON.stringify(book, null, 4));
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;
        const allBooks = await getBooksAsync();
        const filtered_books = Object.values(allBooks).filter(b => b.author === author);
        if (filtered_books.length > 0) {
            return res.send(JSON.stringify(filtered_books, null, 4));
        } else {
            return res.status(404).json({ message: "No books found for this author" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;
        const allBooks = await getBooksAsync();
        const filtered_books = Object.values(allBooks).filter(b => b.title === title);
        if (filtered_books.length > 0) {
            return res.send(JSON.stringify(filtered_books, null, 4));
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Get book review
public_users.get('/review/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        const allBooks = await getBooksAsync();
        const book = allBooks[isbn];
        if (book && book.reviews) {
            return res.send(JSON.stringify(book.reviews, null, 4));
        } else {
            return res.status(404).json({ message: "No reviews found for this book." });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports.general = public_users;
