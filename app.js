const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


const readJsonFile = (filename) => {
  const filePath = path.join(__dirname, "data", filename);
  const fileData = fs.readFileSync(filePath, "utf8");
  return JSON.parse(fileData);
};
function writeJsonFile(filename, data) {
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
} 
function generateUniqueId(){
  return Math.floor(100000+Math.random()*900000)
} 

app.get("/confirmBorrow", function (req, res) {
  res.render("confirmBorrow");
});
app.get("/confirmAdd", function (req, res) {
  res.render("confirmAdd");
});
const bookSuggestions = readJsonFile("book_suggestions.json");
const borrowers = readJsonFile("borrowers.json");


app.get("/admin", (req, res) => {
  const borrowers = readJsonFile("borrowers.json")
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
  const borrowers = {
    id:generateUniqueId(),
    borrower: req.body.borrower,
    'email-id': req.body['email-id'],
    title: req.body.title,
    'due-date': req.body['due-date'],
  }
  const borrowersFilePath = path.join(__dirname, "data", "borrowers.json");
  const existingUsers = readJsonFile("borrowers.json");
  existingUsers.push(borrowers);
  writeJsonFile('borrowers.json', borrowers);

  fs.writeFileSync(borrowersFilePath, JSON.stringify(existingUsers, null, 2), "utf8");
  res.redirect("confirmBorrow");
});
// res.json({ message: 'Borrower added successfully', borrower:borrowers });
// });


// app.post("/admin",function(req,res){
//   const newBook = {
//     title:req.body.title,
//     author:req.body.author,
//   }
//   const filePath = path.join(__dirname,"data","book_suggestions.json")
//   const bookSuggestions = readJsonFile("book_suggestions.json")
// bookSuggestions.push(newBook)
// fs.writeFileSync(filePath,JSON.stringify(bookSuggestions))
// res.redirect("/confirmAdd")
// })


app.post('/admin', (req, res) => {
  const { id } = req.body;

  const borrowers = readJsonFile('borrowers.json');
  // Find the index of the borrower with the given id
  const index = borrowers.findIndex((borrower) => borrower.id === parseInt(id));
  if (index !== -1) {
    borrowers.splice(index, 1); // Remove the borrower entry from the array
    writeJsonFile('borrowers.json', borrowers); // Update the JSON file
    res.json({ message: 'Entry deleted successfully' });
  } else {
    res.status(400).json({ message: 'Invalid borrower id' });
  }
});









app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

module.exports=app;