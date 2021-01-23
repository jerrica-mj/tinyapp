// TINYAPP & EXPRESS SETUP ASSIGNMENT

// Create Web Server with Express and Select Middleware
const express = require("express");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
// import helper functions
const { generateRandomString, prependURL, getUserByEmail, urlsForUser, hashPassword, compareToHashed } = require("./helpers");
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
// ENDPOINTS / ROUTE HANDLING
// ------------------------------------------------------------
// GET / (ROOT)
app.get("/", (req, res) => {
  // redirect to /urls (if logged in) or to /login
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  return res.redirect("/login");
});


// MY URLS PAGE
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    // pass only the urls for the current user
    urls: urlsForUser(req.session.user_id, urlDatabase)
  };
  res.render("urls_index", templateVars);
});


// DELETE A SHORT URL FROM DATABASE
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = urlDatabase[req.params.shortURL];
  // non-200 response if URL not in database, or logged in user is not owner
  if (!shortURL) {
    return res.sendStatus(404);
  }
  if (shortURL.userID !== req.session.user_id) {
    return res.sendStatus(403);
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


// CREATE NEW URL PAGE
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});


// CREATE / ADD NEW SHORT URL TO DATABASE
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


// SHORT URL'S DETAILS PAGE
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


// UPDATE SHORT URL'S LONG URL
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


// REDIRECT SHORT URL TO LONG URL
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    // if shortURL not in urlDatabase, redirect with 404 status code
    return res.redirect(404, "/urls/new");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


// USER REGISTRATION PAGE
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("user_register", templateVars);
});


// REGISTER NEW USER
app.post("/register", (req, res) => {
  // add new user--email and password fields required in HTML form
  const email = req.body.email;
  // hash password for secure storage
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


// USER LOGIN PAGE
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("user_login", templateVars);
});


// LOGIN USER
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // verify registered user, and correct password
  const userExist = getUserByEmail(email, users);
  if (!userExist || !compareToHashed(password, userExist.password)) {
    return res.sendStatus(403);
  }
  req.session.user_id = userExist.id;
  res.redirect("/urls");
});


// LOGOUT USER
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