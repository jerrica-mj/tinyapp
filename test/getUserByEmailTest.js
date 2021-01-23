// Mocha/Chai Testing of getUserByEmail Function

const { assert } = require("chai");

const { getUserByEmail } = require("../helpers");

const testUsers = {
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


describe("getUserByEmail", () => {

  it("returns a user with a valid email", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });

  it("returns undefined if passed an invalid email", () => {
    const user = getUserByEmail("abc@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });

});