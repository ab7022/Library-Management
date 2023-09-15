const express = require("express");
const session = require("express-session");
const mongodbStore = require("connect-mongodb-session");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const db = require("./dataa/database");
const mongoDBStore = mongodbStore(session);
const xss = require("xss")

const sessionStore = new mongoDBStore({
  uri: "mongodb://localhost:27017",
  databaseName: "library",
  collection: "sessions",
});
const csrf = require("csurf")
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());

app.use(
  session({
    secret: "super-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 60 * 1000,
    },
  })
);

// const csrf = require("csurf")
app.use(async function (req, res, next) {
  const user = req.session.user;
  const isAuth = req.session.isAuthenticated;

  if (!user || !isAuth) {
    return next();
  }
  const userDoc = await db
    .getDb()
    .collection("users")
    .findOne({ _id: user.id });
  const isAdmin = userDoc.isAdmin;

  res.locals.isAuth = isAuth;
  res.locals.isAdmin = isAdmin;
  next();
});
async function startApp() {
  try {
    await db.testConnection(); // Ensure the database connection is tested
    await db.connectToDatabase(); // Ensure the database connection is established
    app.listen(4000);
  } catch (error) {
    console.error("Error starting the app:", error);
  }
}

async function isAuthFunction(req, res) {
  const user = req.session.user;
  const isAuth = req.session.isAuthenticated;

  // Check if userDoc exists and has the isAdmin property
  let isAdmin = false;
  if (user) {
    const sessionID = req.sessionID; // Get the session ID of the current session
    const userDoc = await db.getDb().collection("users").findOne({ _id: user.id });

    if (userDoc) {
      console.log("userDoc:", userDoc); // Debug: Check the userDoc data
      isAdmin = userDoc.isAdmin;
    }
  }

  console.log("isAdmin:", isAdmin); // Debug: Check the value of isAdmin
  res.locals.isAuth = isAuth;
  res.locals.isAdmin = isAdmin;
  return { isAuth, isAdmin }; // Return both isAuth and isAdmin as an object
}

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

app.get("/admin", async function (req, res) {
  // Check if the user is authenticated and the user object exists in the session
  if (!req.session.isAuthenticated || !req.session.user) {
    const { isAuth, isAdmin } = await isAuthFunction(req, res);
    return res.status(401).render("401", { isAuth, isAdmin });
  }

  const user = req.session.user;

  try {
    // Attempt to retrieve user information from the database
    const userDoc = await db
      .getDb()
      .collection("users")
      .findOne({ _id: user.id });

    if (!userDoc) {
      const { isAuth, isAdmin } = await isAuthFunction(req, res);
      return res.status(401).render("401", { isAuth, isAdmin });
    }
    
    const isAdmin = userDoc.isAdmin;
    if (!isAdmin) {
      const { isAdmin, isAuth } = await isAuthFunction(req, res);

      // If not an admin, you can handle it accordingly, for example, redirect to a 401 or 403 page
      return res.status(401).render("401", { isAuth, isAdmin });
    }
    // Continue with rendering the admin page or perform other actions
    const borrowers = readJsonFile("borrowers.json");
    const bookSuggestions = readJsonFile("book_suggestions.json");
    const borrowedBooks = bookSuggestions.map((book) => {
      const borrower = borrowers.find(
        (borrower) => borrower.title === book.title
      );
      if (borrower) {
        return { ...book, status: "Borrowed" };
      } else {
        return { ...book, status: "Available" };
      }
    });

    res.render("admin", { books: borrowedBooks, borrowers: borrowers });
  } catch (error) {
    console.error("Error fetching user information:", error);
    const { isAuth, isAdmin } = await isAuthFunction(req, res);
    res.status(401).render("401", { isAuth, isAdmin }); // Handle the error appropriately
  }
});

app.get("/form",async function (req, res) {
  var { isAdmin ,isAuth} = await isAuthFunction(req, res);
  
  res.render("borrowed_books", { isAuth: isAuth, isAdmin: isAdmin });
});


app.get("/index", async function (req, res) {
  var { isAuth, isAdmin } = await isAuthFunction(req, res);

  res.render("index", { isAuth: isAuth, isAdmin: isAdmin });
});


app.get("/", async function (req, res) {
  var { isAuth, isAdmin } = await isAuthFunction(req, res);

  res.render("index", { isAuth: isAuth, isAdmin: isAdmin });
});

app.get("/book_suggestions.json", (req, res) => {
  const filePath = path.join(__dirname, "data", "book_suggestions.json");
  const fileData = fs.readFileSync(filePath, "utf8");
  res.json(JSON.parse(fileData));
});

app.get("/available_books",async function (req, res) {
  const books = readJsonFile("book_suggestions.json");
  var { isAdmin,isAuth } = await isAuthFunction(req, res);

  res.render("available_books", {
    books: books,
    isAuth: isAuth,
    isAdmin: isAdmin,
  });
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
    title: xss(req.body.title),
    author: xss(req.body.author),
  };
  const filePath = path.join(__dirname, "data", "book_suggestions.json");
  const bookSuggestions = readJsonFile("book_suggestions.json");
  bookSuggestions.push(newBook);
  fs.writeFileSync(filePath, JSON.stringify(bookSuggestions));
  res.redirect("/confirmAdd");
});

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

app.get("/login", function (req, res) {
  let sessionInputData = req.session.inputData;

  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      email: "",
      password: "",
    };
  }
  req.session.inputData = null;
  res.render("login-page", { inputData: sessionInputData });
});

startApp();

app.post("/login", async function (req, res) {
  const userData = req.body;
  const enteredEmail = userData.email;
  const enteredPassword = userData.password;
  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (!existingUser) {
    req.session.inputData = {
      hasError: true,
      message: "Couldn't log you in - Please check your credentials!",
      email: enteredEmail,
      password: enteredPassword,
    };
    req.session.save(function () {
      res.redirect("/login");
    });
    return;
    // If the user doesn't exist, handle it appropriately (e.g., show an error message).
  }

  const passwordsAreEqual = await bcrypt.compare(
    enteredPassword,
    existingUser.password
  );

  if (!passwordsAreEqual) {
    req.session.inputData = {
      hasError: true,
      message: "Couldn't log you in - Please check your credentials!",
      email: enteredEmail,
      password: enteredPassword,
    };
    // If the passwords don't match, handle it appropriately (e.g., show an error message).
    console.log("Incorrect password");

    req.session.save(function () {
      res.redirect("/login");
    });
    return;
  }
  // Successfully logged in
  console.log("Logged in successfully");
  // Add your logic for what to do after successful login (e.g., redirect to a dashboard).
  req.session.user = {
    id: existingUser._id,
    email: existingUser.email,
  };
  req.session.isAuthenticated = true;
  req.session.save(function () {
    res.redirect("/profile");
  });
});
app.post("/logout", function (req, res) {
  req.session.user = null;
  req.session.isAuthenticated = false;
  res.redirect("/");
});

app.get("/signup", function (req, res) {
  let sessionInputData = req.session.inputData;

  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      email: "",
      confirmEmail: "",
      password: "",
    };
  }
  req.session.inputData = null;
  res.render("signup-page", { inputData: sessionInputData });
});

app.get("/profile",async function (req, res) {
  const user = req.session.user;
  const isAuth = req.session.isAuthenticated;
  if (!isAuth) {
    return res.status(401).render("401");
  }
  var { isAdmin } = await isAuthFunction(req, res);
  
  res.render("profile-page", { isAuth: isAuth, isAdmin: isAdmin });
});


app.post("/signup", async function (req, res) {
  const userData = req.body;
  const enteredEmail = userData.email;
  const enteredEmail2 = userData["confirm-email"];
  const enteredPassword = userData.password;
  if (
    !enteredEmail ||
    !enteredPassword ||
    !enteredEmail2 ||
    enteredPassword.length < 5 || // Fix this condition, remove the negation
    enteredEmail !== enteredEmail2 ||
    !enteredEmail.includes("@")
  ) {
    req.session.inputData = {
      hasError: true,
      message: "Invalid Input - Please Check your data",
      email: enteredEmail,
      confirmEmail: enteredEmail2,
      password: enteredPassword,
    };

    req.session.save(function () {
      res.redirect("/signup");
    });
  } else {
    const existingUser = await db
      .getDb()
      .collection("users")
      .findOne({ email: enteredEmail });
    if (existingUser) {
      req.session.inputData = {
        hasError: true,
        message: "User Exists Already!",
        email: enteredEmail,
        confirmEmail: enteredEmail2,
        password: enteredPassword,
      };
      console.log("User Already Exists");
      req.session.inputData = {
        hasError: true,
        message: "User already exists.",
        email: enteredEmail,
        confirmEmail: enteredEmail2,
        password: enteredPassword,
      };
      req.session.save(function () {
        res.redirect("/signup");
      });
    } else {
      try {
        const hashedPassword = await bcrypt.hash(enteredPassword, 12);
        const user = {
          email: enteredEmail,
          password: hashedPassword,
          isAdmin:false
        };
        console.log(user);
        await db.getDb().collection("users").insertOne(user);
        res.redirect("/login");
      } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("Error during signup");
      }
    }
  }
});

app.use(function(error,req,res,next){
  console.log(error)
  res.render("500")
})

module.exports = app;

app.get('/401', async (req, res) => {
  var { isAuth, isAdmin } = await isAuthFunction(req, res);
  res.render('401', { isAuth, isAdmin }); // Pass isAuth and isAdmin to the template
});
