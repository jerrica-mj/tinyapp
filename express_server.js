// TINYAPP & EXPRESS SETUP ASSIGNMENT

// Create Web Server with Express and Select Middleware
const express = require("express");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["user_id"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
// use body-parser to convert POST request bodies to readable string, added to the request object under the key "body"
app.use(bodyParser.urlencoded({extended: true}));


// ------------------------------------------------------------
// DATA STORES
// ------------------------------------------------------------
/**
 * Object to keep track of short- and longURLs, and the user_id that created them
 */
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "UaJ48lW"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "Un6I3mE"}
};
/**
 * Object to keep track of registered app users
 */
const users = {
  "UaJ48lW": {
    id: "UaJ48lW",
    email: "user@example.com",
    // unhashed password: "purple-monkey-dinosaur"
    password: "$2b$10$dWtNrbMmbqT.N2G/.r8Uz.c2a8BztISHUsRoQowCAoK7ovd8Sl8gG"
  },
  "Un6I3mE": {
    id: "Un6I3mE",
    email: "user2@example.com",
    // unhashed password: "dishwasher-funk"
    password: "$2b$10$djS.6tcPydEwgnIr.n/0/.36CtgqjbVOgfPPgkHp8Scf/6r/P6bkS"
  }
};


// ------------------------------------------------------------
// FUNCTION(S)
// ------------------------------------------------------------
/**
 * Generates a string of random alphanumeric characters, of mixed case.
 * @param {number} length the number of characters to generate for the resulting string, set to 6 by defaul.
 * @return {string} a string of random alphanumeric characters, of mixed case.
 */
const generateRandomString = (length = 6) => {
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
 * @param {object} database the database object to search for a corresponding user.
 * @return {} identified user object, or false if not found.
 */
const getUserByEmail = (queryEmail, database) => {
  for (const userID in database) {
    if (database[userID].email === queryEmail) {
      return database[userID];
    }
  }
  return false;
};
/**
 * Filters all URLs in urlDatabase to those where the userID is equal to the id of the currently logged-in user.
 * @param {string} id the id of the currently logged-in user.
 * @return {Object} all URLs from the urlDatabase where the userID matches the id parameter.
 */
const urlsForUser = (id) => {
  let result = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      result[url] = urlDatabase[url];
    }
  }
  return result;
};
/**
 * Hash a password, or other string, for secure storage.
 * @param {string} toHash the original string to be hashed.
 * @param {number} salt the number of salt rounds to be used in hashing, set to 10 by default.
 * @return {string} the hashed string.
 */
const hashPassword = (toHash, salt = 10) => {
  return bcrypt.hashSync(toHash, salt);
};
/**
 * Compare an unhashed and hashed string for a match, using bcrypt, which must have been used to hash the hashed string.
 * @param {string} unhashed the unhashed string to be checked.
 * @param {string} hashed the hashed string against which to compare the unhashed string.
 * @return {boolean} true if unhashed matches its hashed counterpart, false if they do not match.
 */
const compareHashed = (unhashed, hashed) => {
  return bcrypt.compareSync(unhashed, hashed);
};


// ------------------------------------------------------------
// ENDPOINTS / ROUTE HANDLING
// ------------------------------------------------------------
// Root Path "/"
app.get("/", (req, res) => {
  res.redirect("/urls");
});


// My URLs Index Page
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    // pass only the urls for the current user
    urls: urlsForUser(req.session.user_id)
  };
  res.render("urls_index", templateVars);
});

// // Delete button
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = urlDatabase[req.params.shortURL];
  if (!shortURL) {
    return res.sendStatus(404);
  }
  // only allow deletion if URL belongs to current user
  if (shortURL.userID !== req.session.user_id) {
    return res.sendStatus(403);
  }
  // "delete" shortURL property from urlDatabase
  delete urlDatabase[req.params.shortURL];
  // redirect back to the "/urls" page
  res.redirect("/urls");
});


// Create New URL Form Page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

// // Add new URL (shortURL: longURL) to urlDatabase
app.post("/urls", (req, res) => {
  // if not signed in, redirect to login page
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const shortURL = generateRandomString();
  const longURL = prependURL(req.body.longURL);
  const userID = req.session.user_id;
  urlDatabase[shortURL] = {longURL, userID};
  res.redirect(`/urls/${shortURL}`);
});


// Short URL's Page
// :shortURL => a route param (req.params.shortURL)
app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.redirect(404, "/urls/new");
  }
  const templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    URL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// // Update shortURL's longURL Button
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // if shortURL doesn't exist, redirect to 'create' page
  if (!urlDatabase[shortURL]) {
    return res.redirect('/urls/new');
  }
  // only allow updating/editing by user the URL belongs to
  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    return res.sendStatus(403);
  }
  const newLongURL = prependURL(req.body.longURL);
  // update existing shortURL's value and redirect to '/urls' page
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});


// Redirect shortURL to its longURL
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    // if shortURL not in urlDatabase, redirect with 404 status code
    return res.redirect(404, "/urls/new");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


// Registration Page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("user_register", templateVars);
});

// // Register New User
app.post("/register", (req, res) => {
  // add new user--only forms with email and password submitted (html form input required)
  const email = req.body.email;
  // hash user's password for secure storage
  const password = hashPassword(req.body.password);
  const userExist = getUserByEmail(email, users);
  if (userExist) {
    // if email already exists in users{}, send 400 (bad request)
    return res.sendStatus(400);
  }
  const userID = "U" + generateRandomString();
  users[userID] = {
    id: userID,
    email,
    password
  };
  req.session.user_id = userID;
  res.redirect("/urls");
});


// Login Form Page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("user_login", templateVars);
});

// // User Login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userExist = getUserByEmail(email, users);
  if (!userExist || !compareHashed(password, userExist.password)) {
    return res.sendStatus(403);
  }
  req.session.user_id = userExist.id;
  res.redirect("/urls");
});


// User Logout
app.post("/logout", (req, res) => {
  // destroy the session to remove the cookie
  if (req.session.user_id) {
    req.session = null;
  }
  res.redirect("/urls");
});


// ------------------------------------------------------------
// LISTEN ON PORT
// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});