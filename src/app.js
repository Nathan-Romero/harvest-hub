// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const exphbs = require("express-handlebars");
const stripJs = require("strip-js");
const path = require('path');
require('dotenv').config();
const plantData = require('./plant-service');

// Get our logger instance
const logger = require('./logger');

// Get the desired port from the process' environment. Default to `8080`
const port = parseInt(process.env.PORT || '8080', 10);

// author and version from our package.json file
const { author, version } = require('../package.json');

const pino = require('pino-http')({
  // Use our default logger instance, which is already configured
  logger,
});

// Create an express app instance we can use to attach middleware and HTTP routes
const app = express();

// Use pino logging middleware
app.use(pino);

// Use helmetjs security middleware
app.use(helmet());

// Use CORS middleware so we can make requests across origins
app.use(cors());

// Use gzip/deflate compression middleware
app.use(compression());


app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static("public"));

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="btn active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      safeHTML: function (context) {
        return stripJs(context);
      },
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      },
    },
  })
);

// Define a simple health check route. If the server is running
// we'll respond with a 200 OK.  If not, the server isn't healthy.
app.get('/health-check', (req, res) => {
  // Clients shouldn't cache this response (always request it fresh)
  // See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#controlling_caching
  res.setHeader('Cache-Control', 'no-cache');

  // Send a 200 'OK' response with info about our repo
  res.status(200).json({
    status: 'ok',
    author,
    githubUrl: 'https://github.com/code-Gambler/fragments',
    version,
  });
});

// Define a simple health check route. If the server is running
// we'll respond with a 200 OK.  If not, the server isn't healthy.
app.get('/home', (req, res) => {
  // Send a 200 'OK' response with info about our repo
  res.render("index", {});
});

app.get('/plants', (req, res) => {
  plantData.getPlants().then((dbPlants) => {
    logger.info(`Returning ${dbPlants.length} plants`);
    logger.info(`Returning ${dbPlants[0].name} plants`);
    logger.info({ dbPlants }, `Returning plants`);
    // const plants = [
    //   { name: 'Tomato', image: '/images/tomato.avif', season: 'Summer' },
    //   { name: 'Carrot', image: '/images/carrot.avif', season: 'Spring' },
    //   { name: 'Pumpkin', image: '/images/pumpkin.jpg', season: 'Fall' },
    // ];
    // Send a 200 'OK' response with info about our repo

    res.render("plants", { dbPlants });
  }).catch((err) => {
    logger.error({ err }, `Error getting plants`);
    res.status(500).json({
      status: 'error',
      error: {
        message: 'unable to process request',
        code: 500,
      },
    });
  });
});

app.get('/', (req, res) => {
  // Send a 200 'OK' response with info about our repo
  res.redirect('/home');
});

// Add 404 middleware to handle any requests for resources that can't be found
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      message: 'not found',
      code: 404,
    },
  });
});

// Add error-handling middleware to deal with anything else
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // We may already have an error response we can use, but if not,
  // use a generic `500` server error and message.
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  // If this is a server error, log something so we can see what's going on.
  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }

  res.status(status).json({
    status: 'error',
    error: {
      message,
      code: status,
    },
  });
});


plantData.initialize().then(() => {
  app.listen(port, () => {
    // Log a message that the server has started, and which port it's using.
    logger.info(`Server started on port ${port}`);
  });
}).catch((err) => {
  logger.error({ err }, `Error initializing DB`);
  process.exit(1);
});
