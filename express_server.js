// TINYAPP & EXPRESS SETUP ASSIGNMENT

// Create Your Web Server with Express

const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

// Set up EJS as templating engine for Express
app.set("view engine", "ejs");
// Set up cookie-parser for use (README: https://github.com/expressjs/cookie-parser)
app.use(cookieParser());

// Object to keep track of URLs and shortened forms
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// ----------------

// FUNCTION(S)
/**
 * returns a string of 6 random alphanumeric characters
 * *TEMP* used to simulate generating a "unique" shortURL
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

// function to ensure all longURLs start with "http://www."
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


// ------------------------------------------------------------------


// ENDPOINT/PATH HANDLING

// ----------------
// POST REQUESTS

// require middleware to parse POST request body (buffer) to be readable
// must come before all route handling, so body-parser library can convert the request body from "Buffer" to readable string, then add the data to the req(request) object under the key "body"
const bodyParser = require("body-parser");
const { request } = require("express");
app.use(bodyParser.urlencoded({extended: true}));

// Handle POST request for "urls_new" form
// should this go before or after the get request route handlers?
app.post("/urls", (req, res) => {
  // log the POST request body (parsed to JS object) to the console
  console.log(req.body);
  const shortURL = generateRandomString();
  // check that longURLs are prepended with "http(s)://www."
  const longURL = prependURL(req.body.longURL);
  // save shortURL-longURL key-value pair to urlDatabase
  urlDatabase[shortURL] = longURL;
  // redirect client to a new page showing their long & shortURL
  res.redirect(`/urls/${shortURL}`);
});


// handle requests from delete buttons on "/urls" page
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(`Deleted: "${req.params.shortURL}": "${urlDatabase[req.params.shortURL]}" from urlDatabase`);
  // use "delete" to remove shortURL property from urlDatabase object
  delete urlDatabase[req.params.shortURL];
  // redirect back to the "/urls" page
  res.redirect("/urls");
});


// handle requests from update buttons
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = prependURL(req.body.longURL);
  // console.log(`Updated '${shortURL}' to redirect to '${newLongURL}' instead of '${urlDatabase[shortURL]}'`);
  // if property doesn't exist, redirect to 'create' page
  if (!urlDatabase.hasOwnProperty(shortURL)) {
    res.redirect('/urls/new');
  }
  // update existing property's value and redirect to '/urls' page
  urlDatabase[shortURL] = newLongURL;
  // redirect back to "/urls" page
  res.redirect("/urls");
});


// login POST request
app.post("/login", (req, res) => {
  // console.log("username:", req.body.username);
  // set a cookie named "username" with the submitted value
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});


// ----------------
// GET REQUESTS

// handler for the root path, "/"
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Pass urlDatabase object to "views/urls_index.ejs"
app.get("/urls", (req, res) => {
  // variables need to be sent to EJS templates inside an object
  const templateVars = {urls: urlDatabase};
  // omit "views/" in path as EJS looks there for .ejs files by convention
  res.render("urls_index", templateVars);
});

// Handle GET (render) route for "urls_new" form
// this must be before "/urls/:shortURL" handler, or express will think that "new" is a route parameter--order routes from most to least specific
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


// Pass urlDatabase to "views/urls_show.ejs"
// the : means that the id (shortURL) is a route parameter that will be available in the "req.params" object
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});


// handle shortURL redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    // if shortURL-longURL is not in the database, redirect to "create" page--attempt to deal with edge case, but could use 404?
    res.redirect("/urls/new");
  }
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// // add additional endpoints/paths
// app.get("/urls.json", (req, res) => {
//   // respond with the urlDatabase object as a JSON string
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   // send HTML content response
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// see if a variable created in one request is accessible in another
// they are not accessible in other request scopes, and will cause a reference error at that endpoint/url if the endpoint calls a value out of scope
// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });


// ------------------------------------------------------------------


// LISTEN ON PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});