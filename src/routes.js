const errorHandler = require('./utils/errors').errorHandler;
const {interaction} = require('./interaction');

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
  console.log(state.serverConfig.interaction_path)
  app.get(state.serverConfig.interaction_path, routeHandler(interaction, state));
}

module.exports = setupRoutes;
