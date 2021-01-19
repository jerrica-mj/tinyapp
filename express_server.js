// TINYAPP & EXPRESS SETUP ASSIGNMENT

// Create Your Web Server with Express

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// Set up EJS as templating engine for Express
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// ENDPOINT/PATH HANDLING
// handler for the root path, "/"
app.get("/", (req, resp) => {
  resp.send("Hello!");
});

// add additional endpoints/paths
app.get("/urls.json", (req, resp) => {
  // respond with the urlDatabase object as a JSON string
  resp.json(urlDatabase);
});

app.get("/hello", (req, resp) => {
  // send HTML content response
  resp.send("<html><body>Hello <b>World</b></body></html>\n");
});

// see if a variable created in one request is accessible in another
// they are not accessible in other request scopes, and will cause a reference error at that endpoint/url if the endpoint calls a value out of scope
app.get("/set", (req, resp) => {
  const a = 1;
  resp.send(`a = ${a}`);
});

app.get("/fetch", (req, resp) => {
  resp.send(`a = ${a}`);
});


// LISTEN ON PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});