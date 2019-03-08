const morgan = require('morgan');
const jsonParser = require('body-parser').json();
const urlEncodedParser = require('body-parser').urlencoded();

const requestLogger = (req, resp, next) => {
  console.log(`\n\nRequest body:\n\n${JSON.stringify(req.body, null, 2)}\n\n`);
  next();
}

const setupMiddleware = (app) => {
  app.use(morgan('dev'));
  app.use(jsonParser);
  app.use(urlEncodedParser);
  app.use(requestLogger);
}

module.exports = setupMiddleware
