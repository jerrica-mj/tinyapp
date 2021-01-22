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
 * Object to keep track of short- and longURLs, and the user_id that created them
 */
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "UaJ48lW"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "UaJ48lW"}
};
/**
 * Object to keep track of registered app users
 */
const users = {
  "UaJ48lW": {
    id: "UaJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "Un6I3mE": {
    id: "Un6I3mE",
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


// Create New URL Form Page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

// // Add new URL (shortURL: longURL) to urlDatabase
app.post("/urls", (req, res) => {
  // if not signed in, redirect to login page
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const shortURL = generateRandomString();
  const longURL = prependURL(req.body.longURL);
  const userID = req.cookies["user_id"];
  urlDatabase[shortURL] = {longURL, userID};
  res.redirect(`/urls/${shortURL}`);
});


// Short URL's Page
// :shortURL => a route param (req.params.shortURL)
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

// // Update shortURL's longURL Button
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = prependURL(req.body.longURL);
  // if shortURL doesn't exist, redirect to 'create' page
  if (!urlDatabase.hasOwnProperty(shortURL)) {
    return res.redirect('/urls/new');
  }
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
    user: users[req.cookies["user_id"]]
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
    return res.sendStatus(400);
  }
  const userID = "U" + generateRandomString();
  users[userID] = {
    id: userID,
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
    return res.sendStatus(403);
  }
  res.cookie("user_id", userExist.id);
  res.redirect("/urls");
});


// User Logout
app.post("/logout", (req, res) => {
  // clear the "user_id" cookie
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