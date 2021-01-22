// TINYAPP & EXPRESS SETUP ASSIGNMENT

// Create Web Server with Express and Select Middleware
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { request } = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());
// use body-parser to convert POST request bodies to readable string, added to the request object under the key "body"
app.use(bodyParser.urlencoded({extended: true}));


// ----------------
// DATA STORES
// ----------------
/**
 * Object to keep track of short- and longURLs
 */
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
/**
 * Object to keep track of registered app users
 */
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


// ----------------
// FUNCTION(S)
// ----------------
/**
 * Generates a string of 6 random alphanumeric characters, of mixed case.
 * @return {string} a string of 6 random alphanumeric characters, of mixed case.
 */
const generateRandomString = () => {
  const length = 6;
  // generate random alphanumeric string with toString(36), removing "0."
  let chars = Math.random().toString(36).substr(2, length);
  let result = chars.split("");
  // randomly capitalize some result characters
  for (let i = 0; i < length; i++) {
    if (Math.round(Math.random()) === 1) {
      result[i] = result[i].toUpperCase();
    }
  }
  return result.join("");
};
/**
 *  Prepends a URL with "http://www." as needed. If the URL already starts with "http://www.", returns the URL as recieved.
 * @param {string} url the URL to be prepended as needed.
 * @return {string} the URL, prepended with "http://www.".
 */
const prependURL = (url) => {
  let longURL = url.split(".");
  if (longURL[0] !== "http://www" || longURL[0] !== "https://www") {
    if (longURL[0] === "www") {
      // input ex: "www.google.com" => add "http://" to [0]
      longURL[0] = "http://" + longURL[0];
    } else {
      // input ex: "google.com" => add "http://www." to [0]
      longURL[0] = "http://www." + longURL[0];
    }
  }
  return longURL.join(".");
};

/**
 * Looks up a registered user by their email. Returns the user object, or false if not found.
 * @param {string} queryEmail the email string for searching all registered users.
 * @return {} identified user object, or false if not found.
 */
const getUserByEmail = (queryEmail) => {
  for (const userID in users) {
    if (users[userID].email === queryEmail) {
      return users[userID];
    }
  }
  return false;
};


// ----------------
// ENDPOINTS / ROUTE HANDLING
// ----------------
// Root Path "/"
app.get("/", (req, res) => {
  res.redirect("/urls");
});


// My URLs Index Page
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// // Delete button
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(`Deleted: "${req.params.shortURL}": "${urlDatabase[req.params.shortURL]}" from urlDatabase`);
  // use "delete" to remove shortURL property from urlDatabase object
  delete urlDatabase[req.params.shortURL];
  // redirect back to the "/urls" page
  res.redirect("/urls");
});


// Create New URL Form
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

// // Add new URL (shortURL: longURL) to urlDatabase
app.post("/urls", (req, res) => {
  // console.log(req.body); // DEBUGGER
  const shortURL = generateRandomString();
  const longURL = prependURL(req.body.longURL);
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});


// Short URL's Page
// :shortURL => a route param (req.params.shortURL)
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    // username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// // Update shortURL's longURL Button
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = prependURL(req.body.longURL);
  // if shortURL doesn't exist, redirect to 'create' page
  if (!urlDatabase.hasOwnProperty(shortURL)) {
    res.redirect('/urls/new');
  }
  // update existing shortURL's value and redirect to '/urls' page
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});


// Redirect shortURL to its longURL
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    // if shortURL not in urlDatabase, redirect with 404 status code
    res.redirect("/urls/new", 404);
  }
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


// Registration Page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
    // , username: req.cookies["username"]
  };
  res.render("user_register", templateVars);
});

// // Register New User
app.post("/register", (req, res) => {
  // add new user--only forms with email and password submitted (html form input required)
  const email = req.body.email;
  const password = req.body.password;
  const userExist = getUserByEmail(email);
  if (userExist) {
    // if email already exists in users{}, send 400 (bad request)
    res.status(400).send(`Uh oh, it looks like a user already exists with email: ${email}. Try logging in instead.`);
  }
  const userID = "U" + generateRandomString();
  users[userID] = {
    userID,
    email,
    password
  };
  // console.log("Added:", userID, users[userID]); // DEBUGGER
  res.cookie("user_id", userID);
  res.redirect("/urls");
});


// Login Form Page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("user_login", templateVars);
});

// // User Login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userExist = getUserByEmail(email);
  if (!userExist || password !== userExist.password) {
    res.status(403);
  }
  res.cookie("user_id", userExist.id);
  res.redirect("/urls");
});


// User Logout
app.post("/logout", (req, res) => {
  // clear the "username" cookie
  if (req.cookies["username"]) {
    res.clearCookie("username");
  }
  if (req.cookies["user_id"]) {
    res.clearCookie("user_id");
  }
  res.redirect("/urls");
});


// ----------------
// LISTEN ON PORT
// ----------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});