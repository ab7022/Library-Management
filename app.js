const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());

const readJsonFile = (filename) => {
  const filePath = path.join(__dirname, "data", filename);
  const fileData = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileData);
};

function writeJsonFile(filename, data) {
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function generateUniqueId() {
  return Math.floor(100000 + Math.random() * 900000);
}

app.get("/confirmBorrow", function (req, res) {
  try {
    const borrowers = readJsonFile("borrowers.json");
    const bookSuggestions = readJsonFile("book_suggestions.json");
    const latestBorrowedBook = borrowers[borrowers.length - 1];
    const borrowedBook = bookSuggestions.find(
      (book) => book.title === latestBorrowedBook.title
    );

    const latestBorrowedEntry = {
      id: latestBorrowedBook.id,
      title: borrowedBook.title,
      author: borrowedBook.author,
      borrower: latestBorrowedBook.borrower,
      "email-id": latestBorrowedBook["email-id"],
      "due-date": latestBorrowedBook["due-date"],
    };

    res.render("confirmBorrow", { latestBorrowedEntry }); // Pass the latest borrowed entry to the view
  } catch (err) {
    console.error("Error processing data:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/confirmAdd", function (req, res) {
  res.render("confirmAdd");
});

app.get("/return", function (req, res) {
  res.render("return");
});

app.get("/admin", (req, res) => {
  const borrowers = readJsonFile("borrowers.json");
  const bookSuggestions = readJsonFile("book_suggestions.json");
  const borrowedBooks = bookSuggestions.map((book) => {
    const borrower = borrowers.find(
      (borrower) => borrower.title === book.title);
    if (borrower) {
      return { ...book, status: "Borrowed" };
    } else {
      return { ...book, status: "Available" };
    }
  });
  res.render("admin", { books: borrowedBooks, borrowers: borrowers });
});

app.get("/form", function (req, res) {
  res.render("borrowed_books");
});

app.get("/index", function (req, res) {
  res.render("index");
});

app.get("/book_suggestions.json", (req, res) => {
  const filePath = path.join(__dirname, "data", "book_suggestions.json");
  const fileData = fs.readFileSync(filePath, "utf8");
  res.json(JSON.parse(fileData));
});

app.get("/available_books", function (req, res) {
  const books = readJsonFile("book_suggestions.json");
  res.render("available_books", { books: books });
});

app.post("/form", function (req, res) {
  const borrowedBook = {
    id: generateUniqueId(),
    borrower: req.body.borrower,
    "email-id": req.body["email-id"],
    title: req.body.title,
    "due-date": req.body["due-date"],
  };
  borrowedBooks.push(borrowedBook); // Add the new borrowed book entry to the array
  const borrowersFilePath = path.join(__dirname, "data", "borrowers.json");
  const existingUsers = readJsonFile("borrowers.json");
  existingUsers.push(borrowedBook);
  writeJsonFile("borrowers.json", existingUsers);
  fs.writeFileSync(
    borrowersFilePath,
    JSON.stringify(existingUsers, null, 2),
    "utf8"
  );
  res.redirect("confirmBorrow");
});

app.post("/admin", function (req, res) {
  const newBook = {
    title: req.body.title,
    author: req.body.author,
  };
  const filePath = path.join(__dirname, "data", "book_suggestions.json");
  const bookSuggestions = readJsonFile("book_suggestions.json");
  bookSuggestions.push(newBook);
  fs.writeFileSync(filePath, JSON.stringify(bookSuggestions));
  res.redirect("/confirmAdd");
});

function readBooksData() {
  try {
    const bookSuggestions = readJsonFile("book_suggestions.json");
    return JSON.parse(bookSuggestions);
  } catch (error) {
    console.error("Error reading books data:", error);
    return [];
  }
}

function writeBooksData(books) {
  try {
    fs.writeFileSync(
      "data/book_suggestions.json",
      JSON.stringify(books, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error("Error writing books data:", error);
  }
}

function deleteBookById(books, bookIdToDelete) {
  const index = books.findIndex((book) => book.id === bookIdToDelete);
  if (index !== -1) {
    books.splice(index, 1);
  }
}


app.delete("/deleteBook/:id", (req, res) => {
  const bookIdToDelete = req.params.id;
  let booksData = readJsonFile("book_suggestions.json");
  const bookToDelete = booksData.find((book) => book.id === bookIdToDelete);
  if (!bookToDelete) {
    return res.status(404).json({ message: "Book not found." });
  }
  deleteBookById(booksData, bookIdToDelete);
  writeBooksData(booksData);
  res.json({ message: "Book deleted successfully." });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

module.exports = app;
