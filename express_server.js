// TINYAPP & EXPRESS SETUP ASSIGNMENT

// Create Your Web Server with Express

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});