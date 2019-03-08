const errorHandler = require('./utils/errors').errorHandler;

const routeHandler = (handler, state) => {

  let handleRoute = async (req, resp) => {
    let response = await handler(req, state);
    resp.json(response);
  }

  return (req, resp) => {
    handleRoute(req, resp).catch(errorHandler(resp));
  }
}

const setupRoutes = (app, state) => {
  app.get('/hai', (req, resp) => resp.send("hai"));
}

module.exports = setupRoutes;
