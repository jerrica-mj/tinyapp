// Store Helper Functions Here
// Keep code DRY, modular, and concise by storing functions here for export and use in other project files.

// ------------------------------------------------------------
// DEPENDENCIES
// ------------------------------------------------------------
const bcrypt = require("bcrypt");


// ------------------------------------------------------------
// FUNCTIONS
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
  return undefined;
};
/**
 * Filters all URLs in a database to those where the associated user ID matches that of the currently logged-in user.
 * @param {string} id the user id of the currently logged-in user.
 * @param {object} database the database object in which to search.
 * @return {Object} all URLs from the database where the associated user ID matches the id parameter.
 */
const urlsForUser = (id, database) => {
  let result = {};
  for (let url in database) {
    if (database[url].userID === id) {
      result[url] = database[url];
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
const compareToHashed = (unhashed, hashed) => {
  return bcrypt.compareSync(unhashed, hashed);
};


module.exports = { generateRandomString, prependURL, getUserByEmail, urlsForUser, hashPassword, compareToHashed };