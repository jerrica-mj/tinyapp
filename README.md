# TinyApp Project
TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

TinyApp lets users register with an email to:
- Create new shortened URLs;
- See all shortened URLs on their account;
- Update the long URL for their shortened URLs; and
- Delete any of their shortened URLs.

## Final Product
!["screenshot of URLs page for a logged in user"](#)
!["screenshot of URLs page when no user is logged in"](#)
!["screenshot of a shortened URL's page when its user is logged in"](#)
!["screenshot of a shortened URL's page when no user or a user other than its creator is logged in"](#)
!["screenshot of registration page"](#)

## Dependencies
- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started
- Install all dependencies (using the `npm install` command).
- Run the development web server using either the `node express_server.js` or the `npm start` command.