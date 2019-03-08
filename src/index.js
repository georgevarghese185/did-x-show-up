const express = require('express');

const Sequelize = require('./db/sequelize');
const Middleware = require('./middleware');
const Routes = require('./routes');
const {getServerConfig} = require('./utils/configs')

const app = express();

const start = async (app) => {
  console.log("Setting up Sequelize");
  const {sequelize, models} = await Sequelize.setupSequelize();

  let serverConfig = await getServerConfig();

  console.log("\nSetting up Express");
  Middleware(app, sequelize);
  Routes(app, {sequelize, models, serverConfig});

  console.log("\nStarting Server");
  await new Promise((resolve, reject) => {app.listen(serverConfig.port || 4000, resolve)});
  console.log("\nServer Started!");
  console.log(`\n\nListening on ${serverConfig.port || 4000}`);
}

start(app)
  .catch(e => {
    console.error(`\n\nFAILED TO START SERVER: ${e.toString()}`);
  });
