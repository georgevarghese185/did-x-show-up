const errorHandler = require('./utils/errors').errorHandler;
const {interaction} = require('./interaction');
const {ask} = require('./message');
const {command} = require('./command');

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
  app.post("/interaction/" + state.serverConfig.interaction_id, routeHandler(interaction, state));
  app.post("/command/" + state.serverConfig.command_id + "/*", routeHandler(command, state))
  app.post('/ask', routeHandler(ask, state))
}

module.exports = setupRoutes;
