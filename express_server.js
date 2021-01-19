// TINYAPP & EXPRESS SETUP ASSIGNMENT

// Create Your Web Server with Express

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// Set up EJS as templating engine for Express
app.set("view engine", "ejs");

// Object to keep track of URLs and shortened forms
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


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
}



// ENDPOINT/PATH HANDLING
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
  // make shortURL
  const shortURL = generateRandomString();
  // save shortURL-longURL key-value pair to urlDatabase
  urlDatabase[shortURL] = req.body.longURL;
  // redirect client to a new page showing their long & shortURL
  res.redirect(`/urls/${shortURL}`);
});


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


// LISTEN ON PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});