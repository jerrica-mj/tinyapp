# TinyApp Project
TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

TinyApp lets users register with an email to:
- Create new shortened URLs;
- See all shortened URLs on their account;
- Update the long URL for their shortened URLs; and
- Delete any of their shortened URLs.

## Final Product
!["screenshot of URLs page for a logged in user"](https://github.com/jerrica-mj/tinyapp/blob/master/docs/urls_page2.png)
!["screenshot of URLs page when no user is logged in"](https://github.com/jerrica-mj/tinyapp/blob/master/docs/urls_page1.png)
!["screenshot of a shortened URL's page when its user is logged in"](https://github.com/jerrica-mj/tinyapp/blob/master/docs/short_url_details_page2.png)
!["screenshot of a shortened URL's page when when its user is NOT logged in"](https://github.com/jerrica-mj/tinyapp/blob/master/docs/short_url_details_page1.png)
!["screenshot of login page"](https://github.com/jerrica-mj/tinyapp/blob/master/docs/login_page.png)

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