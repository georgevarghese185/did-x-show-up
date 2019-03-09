const errorHandler = require('./utils/errors').errorHandler;
const {interaction} = require('./interaction');
const {postShowUpQuestion} = require('./message');

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
  app.post(state.serverConfig.interaction_path, routeHandler(interaction, state));
  app.get('/postShowUpQuestion', routeHandler(postShowUpQuestion, state))
}

module.exports = setupRoutes;
