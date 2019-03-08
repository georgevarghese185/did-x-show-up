const express = require('express');

const Sequelize = require('./db/sequelize');
const Middleware = require('./middleware');
const Routes = require('./routes');

const app = express();
const PORT = 4000;

const start = async (app) => {
  console.log("Setting up Sequelize");
  const {sequelize, models} = await Sequelize.setupSequelize();

  console.log("\nSetting up Express");
  Middleware(app, sequelize);
  Routes(app, {sequelize, models});

  console.log("\nStarting Server");
  await new Promise((resolve, reject) => {app.listen(PORT, resolve)});
  console.log("\nServer Started!");
  console.log(`\n\nListening on ${PORT}`);
}

start(app)
  .catch(e => {
    console.error(`\n\nFAILED TO START SERVER: ${e.toString()}`);
  });
