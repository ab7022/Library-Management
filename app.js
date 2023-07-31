const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Function to read JSON file
const readJsonFile = (filename) => {
  const filePath = path.join(__dirname, "data", filename);
  const fileData = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileData);
};

const bookSuggestions = readJsonFile("book_suggestions.json");
const borrowers = readJsonFile("borrowers.json");

app.get("/confirm", function (req, res) {
  res.render("confirm");
});


app.get("/admin", (req, res) => {
  const borrowedBooks = bookSuggestions.map((book) => {
    const borrower = borrowers.find((borrower) => borrower.title === book.title);
    if (borrower) {  // status.classList.add("statusTrue")
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

app.get("/available_books", function (req, res) {
  const books = readJsonFile("book_suggestions.json");
  res.render("available_books", { books: books });
});

app.post("/form", function (req, res) {
  const libraryData = req.body;
  const borrowersFilePath = path.join(__dirname, "data", "borrowers.json");
  const existingUsers = readJsonFile("borrowers.json");
  existingUsers.push(libraryData);
  fs.writeFileSync(borrowersFilePath, JSON.stringify(existingUsers, null, 2), "utf8");
  res.redirect("/confirm");
});
app.post("/admin", function (req, res) {
  const newBook = {
    title: req.body.title,
    author: req.body.author
  };

  const bookSuggestionsFilePath = path.join(__dirname, "data", "book_suggestions.json");
  const bookSuggestions = readJsonFile("book_suggestions.json");
  bookSuggestions.push(newBook);
  fs.writeFileSync(bookSuggestionsFilePath, JSON.stringify(bookSuggestions, null, 2), "utf8");
  res.redirect("/admin");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

module.exports=app;